from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.agent.schemas import TransactionResponse
import yfinance as yf
import pandas as pd

from backend.database import get_db
from backend.models import User, PortfolioItem, Transaction
from backend.utils.auth import get_current_user
from backend.utils.logger import logger

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

class TransactionCreate(BaseModel):
    ticker: str
    type: str # 'BUY' or 'SELL'
    shares: float
    price: float

class PortfolioSummaryResponse(BaseModel):
    total_value: float
    total_gain: float
    total_gain_percent: float
    holdings: List[Dict[str, Any]]

@router.post("/transaction", response_model=Dict[str, str])
async def add_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Record a new buy or sell transaction and update the portfolio aggregate.
    """
    ticker = transaction.ticker.upper().strip()
    trans_type = transaction.type.upper()
    
    if trans_type not in ['BUY', 'SELL']:
        raise HTTPException(status_code=400, detail="Transaction type must be BUY or SELL")

    # 1. Fetch current portfolio item for this ticker
    result = await db.execute(
        select(PortfolioItem)
        .where(PortfolioItem.user_id == current_user.id)
        .where(PortfolioItem.ticker == ticker)
    )
    portfolio_item = result.scalars().first()

    if trans_type == 'BUY':
        if not portfolio_item:
            portfolio_item = PortfolioItem(
                user_id=current_user.id,
                ticker=ticker,
                shares=transaction.shares,
                average_cost=transaction.price
            )
            db.add(portfolio_item)
        else:
            # Weighted average cost calculation
            new_total_shares = portfolio_item.shares + transaction.shares
            new_avg_cost = ((portfolio_item.shares * portfolio_item.average_cost) + 
                            (transaction.shares * transaction.price)) / new_total_shares
            portfolio_item.shares = new_total_shares
            portfolio_item.average_cost = new_avg_cost
    else: # SELL
        if not portfolio_item or portfolio_item.shares < transaction.shares:
            raise HTTPException(status_code=400, detail="Insufficient shares to sell")
        
        portfolio_item.shares -= transaction.shares
        if portfolio_item.shares <= 0:
            await db.delete(portfolio_item)

    # 2. Record the raw transaction
    new_transaction = Transaction(
        user_id=current_user.id,
        ticker=ticker,
        type=trans_type,
        shares=transaction.shares,
        price=transaction.price
    )
    db.add(new_transaction)
    
    await db.commit()
    logger.info(f"User {current_user.email} logged {trans_type} for {ticker}")
    return {"status": "success", "message": f"Transaction recorded for {ticker}"}

@router.get("/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the user's portfolio summary with real-time P&L.
    """
    result = await db.execute(
        select(PortfolioItem).where(PortfolioItem.user_id == current_user.id)
    )
    holdings = result.scalars().all()
    
    if not holdings:
        return {
            "total_value": 0.0,
            "total_gain": 0.0,
            "total_gain_percent": 0.0,
            "holdings": []
        }

    tickers = [h.ticker for h in holdings]
    
    try:
        # Fetch current market prices
        data = yf.download(tickers, period="1d", group_by="ticker", progress=False)
        
        total_value = 0.0
        total_cost = 0.0
        processed_holdings = []
        
        for item in holdings:
            ticker = item.ticker
            try:
                # yf.download with group_by='ticker' returns MultiIndex
                price = float(data[ticker]["Close"].iloc[-1])
                import math
                if math.isnan(price):
                    price = item.average_cost
            except:
                price = item.average_cost # Fallback to cost if price fetch fails
                
            current_market_value = item.shares * price
            cost_basis = item.shares * item.average_cost
            item_gain = current_market_value - cost_basis
            item_gain_percent = (item_gain / cost_basis * 100) if cost_basis != 0 else 0
            
            total_value += current_market_value
            total_cost += cost_basis
            
            processed_holdings.append({
                "ticker": ticker,
                "shares": item.shares,
                "average_cost": round(item.average_cost, 2),
                "current_price": round(price, 2),
                "market_value": round(current_market_value, 2),
                "gain": round(item_gain, 2),
                "gain_percent": round(item_gain_percent, 2)
            })
            
        total_gain = total_value - total_cost
        total_gain_percent = (total_gain / total_cost * 100) if total_cost != 0 else 0
        
        return {
            "total_value": round(total_value, 2),
            "total_gain": round(total_gain, 2),
            "total_gain_percent": round(total_gain_percent, 2),
            "holdings": processed_holdings
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch portfolio market data: {e}")
        # Return fallback data if yf fails entirely
        return {
            "total_value": sum(h.shares * h.average_cost for h in holdings),
            "total_gain": 0.0,
            "total_gain_percent": 0.0,
            "holdings": [{
                "ticker": h.ticker,
                "shares": h.shares,
                "average_cost": h.average_cost,
                "current_price": h.average_cost,
                "market_value": h.shares * h.average_cost,
                "gain": 0.0,
                "gain_percent": 0.0
            } for h in holdings]
        }

@router.get("/review", response_model=Dict[str, str])
async def get_portfolio_review(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an AI-driven portfolio review using Claude.
    """
    # 1. Get current summary
    summary = await get_portfolio_summary(current_user, db)
    
    if not summary or not summary.get("holdings"):
        return {
            "review": "Your portfolio is currently empty. Add some transactions to get a professional AI review!"
        }

    # 2. Formulate analytical prompt
    holdings_str = "\n".join([
        f"- {h['ticker']}: {h['shares']} shares @ ${h['average_cost']} (Market Value: ${h['market_value']}, P&L: {h['gain_percent']}%)"
        for h in summary['holdings']
    ])
    
    prompt = f"""
    You are a Senior Wealth Manager. Please perform a professional audit of this client's portfolio:
    
    TOTAL VALUE: ${summary['total_value']}
    TOTAL GAIN/LOSS: ${summary['total_gain']} ({summary['total_gain_percent']}%)
    
    HOLDINGS:
    {holdings_str}
    
    Please provide:
    1. **Diversification Analysis**: Check for over-concentration in sectors or individual assets.
    2. **Risk Assessment**: Identify potential vulnerabilities (volatility, macro exposure).
    3. **Actionable Suggestions**: Specific rebalancing advice or 'Stay the Course' recommendations.
    4. **Health Score**: A single numeric score from 1-10 with a brief justification.
    
    Use a professional, encouraging, yet critically analytical tone. Format with clear markdown headings.
    """
    
    try:
        from backend.agent.router import agent
        if agent is None:
            raise HTTPException(
                status_code=503, 
                detail="AI Wealth Manager is still calibrating. Please try again in 30 seconds."
            )
        review_content = await agent.analyze(prompt)
        return {"review": review_content}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI Portfolio Review failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"The AI Wealth Manager is currently busy: {str(e)}"
        )

@router.get("/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the user's full transaction history.
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
    )
    return result.scalars().all()

import yfinance as yf
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from pydantic import BaseModel
import pandas as pd

from backend.database import get_db
from backend.models import User, WatchlistItem
from backend.utils.auth import get_current_user
from backend.utils.logger import logger
from backend.utils.cache import ttl_cache

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

class WatchlistRequest(BaseModel):
    ticker: str

class WatchlistResponse(BaseModel):
    id: int
    ticker: str
    price: float
    change_percent: float

@router.post("", response_model=Dict[str, str])
async def toggle_watchlist_item(
    request: WatchlistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add or remove a ticker from the user's watchlist.
    """
    ticker = request.ticker.upper().strip()
    
    # Check if it already exists
    result = await db.execute(
        select(WatchlistItem)
        .where(WatchlistItem.user_id == current_user.id)
        .where(WatchlistItem.ticker == ticker)
    )
    existing_item = result.scalars().first()
    
    if existing_item:
        # Remove from watchlist
        await db.delete(existing_item)
        await db.commit()
        logger.info(f"User {current_user.email} removed {ticker} from watchlist")
        return {"status": "removed", "ticker": ticker}
    else:
        # Add to watchlist
        new_item = WatchlistItem(user_id=current_user.id, ticker=ticker)
        db.add(new_item)
        await db.commit()
        logger.info(f"User {current_user.email} added {ticker} to watchlist")
        return {"status": "added", "ticker": ticker}

@router.get("", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the user's watchlist with current live prices.
    """
    result = await db.execute(
        select(WatchlistItem).where(WatchlistItem.user_id == current_user.id)
    )
    items = result.scalars().all()
    
    if not items:
        return []
        
    tickers = [item.ticker for item in items]
    
    # Batch fetch live pricing for all saved tickers
    try:
        # yfinance allows downloading multiple tickers at once
        data = yf.download(tickers, period="5d", group_by="ticker", threads=True, progress=False)
        
        response_data = []
        for item in items:
            ticker = item.ticker
            try:
                # yf.download with group_by='ticker' always returns MultiIndex
                # even for a single ticker. Let's access it safely.
                if ticker in data.columns.levels[0]:
                    hist = data[ticker]
                else:
                    hist = None
                    
                if hist is not None and not hist.empty and len(hist) >= 2:
                    # Get the most recent two close prices
                    closes = hist["Close"].dropna()
                    if len(closes) >= 2:
                        current_price = float(closes.iloc[-1])
                        prev_price = float(closes.iloc[-2])
                        change_pct = ((current_price - prev_price) / prev_price) * 100
                    else:
                        current_price = float(closes.iloc[-1]) if not closes.empty else 0.0
                        change_pct = 0.0
                elif hist is not None and not hist.empty:
                    current_price = float(hist["Close"].iloc[-1])
                    change_pct = 0.0
                else:
                     current_price = 0.0
                     change_pct = 0.0
            except Exception as e:
                logger.warning(f"Watchlist price fetch failed for {ticker}: {e}")
                current_price = 0.0
                change_pct = 0.0
                
            response_data.append({
                "id": item.id,
                "ticker": ticker,
                "price": round(current_price, 2),
                "change_percent": round(change_pct, 2)
            })
            
        return response_data
        
    except Exception as e:
        logger.error(f"Failed to batch fetch watchlist data: {e}")
        # Return base items if yfinance fails
        return [{"id": item.id, "ticker": item.ticker, "price": 0.0, "change_percent": 0.0} for item in items]

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List

from backend.services.analytics_service import analytics_service
from backend.utils.auth import get_current_user
from backend.models import User

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/fundamentals/{ticker}", response_model=Dict[str, Any])
async def get_fundamentals(
    ticker: str,
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve comprehensive fundamental data including profile, key ratios,
    balance sheet, income statement, and cash flow for a specific ticker.
    """
    try:
        return await analytics_service.get_fundamental_data(ticker=ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error fetching fundamentals")

@router.get("/technicals/{ticker}", response_model=Dict[str, Any])
async def get_technicals(
    ticker: str,
    period: str = Query("1y", description="Time period for technicals (e.g., 1mo, 3mo, 6mo, 1y)"),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve technical indicators (MACD, Bollinger Bands, Stochastic) for a specific ticker.
    """
    try:
        return await analytics_service.get_technical_indicators(ticker=ticker, period=period)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error fetching technicals")

@router.get("/calendar", response_model=List[Dict[str, Any]])
async def get_calendar(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the upcoming macroeconomic events calendar.
    """
    try:
        return await analytics_service.get_economic_calendar()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error fetching economic calendar")

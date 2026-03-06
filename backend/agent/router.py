"""
API router for FinAgent-Pro.

This module defines HTTP endpoints that expose the finance agent's capabilities,
including health checks and query analysis.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from backend.agent.schemas import (
    HealthResponse,
    NewsRegion,
    NewsResponse,
    QueryRequest,
    QueryResponse,
    DashboardResponse,
    InsightResponse
)
from backend.services.news_service import news_service
from backend.services.dashboard_service import dashboard_service
from backend.utils.limiter import rate_limit
from backend.utils.logger import logger
from backend.utils.cache import ttl_cache

# Router for /health, /analyze, and /news endpoints
router = APIRouter()

# FinanceAgent instance set at startup via set_agent(); used by /analyze
agent: Optional[object] = None


def set_agent(instance: object) -> None:
    """
    Inject a FinanceAgent instance into the router module.

    This function is called from the FastAPI lifespan handler so that
    endpoints can access the initialized agent without re-creating it.

    Args:
        instance (object): Initialized FinanceAgent (or compatible) instance.
    """
    global agent
    agent = instance


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint for the FinAgent API.

    Returns:
        HealthResponse: Simple status object indicating API health and whether
                        the finance agent has been initialized.
    """
    logger.info("Health check requested.")
    return HealthResponse(status="ok", agent_ready=agent is not None)


@router.post(
    "/analyze",
    tags=["Analysis"],
    summary="Analyze a financial query with streaming response",
    response_description="Server-Sent Events streaming the AI-generated analysis",
)
async def analyze(request: Request, body: QueryRequest) -> StreamingResponse:
    """
    Stream a financial query analysis using the injected FinanceAgent.

    **Request body (JSON):** `{"query": "Analyze AAPL"}` — must be JSON with a `query` field.

    **Returns:** A text/event-stream of the analysis text chunks.
    """
    if agent is None:
        logger.error("Analysis requested but agent is not initialized.")
        raise HTTPException(
            status_code=503,
            detail="Agent not initialized. Server may still be starting up.",
        )

    logger.info(f"Received streaming analysis request for query: {body.query[:50]}...")
    
    return StreamingResponse(
        agent.stream_analyze(body.query),
        media_type="text/event-stream"
    )



@router.get(
    "/news",
    response_model=NewsResponse,
    tags=["Market Latest News"],
    summary="Get latest market news",
    response_description="Latest news items for the requested region and optional ticker",
)
@ttl_cache(ttl_seconds=120)
async def get_latest_market_news(
    request: Request,
    region: NewsRegion = NewsRegion.GLOBAL,
    ticker: Optional[str] = None,
    limit: int = 10,
) -> NewsResponse:
    """
    Fetch latest stock market news for a given region and optional ticker symbol.

    Query parameters:
    - `region`: NewsRegion enum (US, INDIA, GLOBAL)
    - `ticker`: Optional stock ticker (e.g., AAPL) to filter news
    - `limit`: Maximum number of news items to return (default 10)
    """
    logger.info(f"Fetching news for region={region}, ticker={ticker}, limit={limit}")
    news_items = await news_service.get_market_news(region, ticker, limit)

    return NewsResponse(
        region=region,
        items=news_items,
        total_results=len(news_items),
    )


@router.get("/dashboard",response_model=DashboardResponse,tags=["Market Data"], dependencies=[Depends(rate_limit(20, 10))])
@ttl_cache(ttl_seconds=120)
async def get_dashboard(request:Request,ticker:str="AAPL"):
    data = await dashboard_service.get_dashboard_data(ticker)
    return data

@router.get("/dashboard/insight", response_model=InsightResponse, tags=["Market Data"], dependencies=[Depends(rate_limit(10, 10))])
@ttl_cache(ttl_seconds=300)
async def get_dashboard_insight(request: Request, ticker: str = "AAPL"):
    """
    Generate an AI-powered stock sentiment overview.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized.")
        
    try:
        query = f"Provide a brief 1-word sentiment (Bullish, Bearish, or Neutral), 3 ultra-concise bullet points of fundamental/technical insight, and a 2-word recommendation for {ticker}. Format your response exactly like this: \nSentiment: [word]\nBullets: \n- [point1]\n- [point2]\n- [point3]\nRecommendation: [words]"
        
        raw_response = await agent.analyze(query)
        
        # Parse the rigid string format
        sentiment = "Neutral"
        bullets = []
        rec = "Hold"
        
        lines = [line.strip() for line in raw_response.split('\n') if line.strip()]
        for line in lines:
            if line.startswith("Sentiment:"):
                sentiment = line.replace("Sentiment:", "").strip()
            elif line.startswith("- "):
                bullets.append(line.replace("- ", "").strip())
            elif line.startswith("Recommendation:"):
                rec = line.replace("Recommendation:", "").strip()
                
        # Fallback if unstructured
        if len(bullets) == 0:
            bullets = ["Waiting for technicals", "AI processing delayed", "Market dynamic"]
            
        return InsightResponse(
            ticker=ticker.upper(),
            sentiment=sentiment,
            summary_bullets=bullets[:3],
            recommendation=rec
        )
        
    except Exception as e:
        logger.error(f"Insight generation error: {e}")
        # Soft fallback during errors to not break dashboard
        return InsightResponse(
            ticker=ticker.upper(),
            sentiment="Neutral",
            summary_bullets=["Unable to fetch AI insight.", "Try again later.", "API may be restricted."],
            recommendation="Hold"
        )
"""
API router for FinAgent-Pro.

This module defines HTTP endpoints that expose the finance agent's capabilities,
including health checks and query analysis.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from backend.agent.schemas import (
    HealthResponse,
    NewsRegion,
    NewsResponse,
    QueryRequest,
    QueryResponse,
    DashboardResponse
)
from backend.services.news_service import news_service
from backend.services.dashboard_service import dashboard_service
from backend.utils.logger import logger

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
    response_model=QueryResponse,
    tags=["Analysis"],
    summary="Analyze a financial query",
    response_description="AI-generated analysis for the given query",
)
async def analyze(request: Request, body: QueryRequest) -> QueryResponse:
    """
    Analyze a financial query using the injected FinanceAgent.

    **Request body (JSON):** `{"query": "Analyze AAPL"}` — must be JSON with a `query` field (1–1000 chars).

    **Returns:** `{"query": "...", "response": "..."}` with the analysis text.

    Raises **503** if the agent is not yet initialized; **422** if body is missing or invalid.
    """
    if agent is None:
        logger.error("Analysis requested but agent is not initialized.")
        raise HTTPException(
            status_code=503,
            detail="Agent not initialized. Server may still be starting up.",
        )

    logger.info(f"Received analysis request for query: {body.query[:50]}...")
    result = await agent.analyze(body.query)

    logger.info("Analysis request completed successfully.")
    return QueryResponse(query=body.query, response=result)



@router.get(
    "/news",
    response_model=NewsResponse,
    tags=["Market Latest News"],
    summary="Get latest market news",
    response_description="Latest news items for the requested region and optional ticker",
)
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


@router.get("/dashboard",response_model=DashboardResponse,tags=["Market Data"])
async def get_dashboard(request:Request,ticker:str="AAPL"):
    try:
        data = await dashboard_service.get_dashboard_data(ticker)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404,detail=str(e))
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500,detail="Failed to load dashboard data")
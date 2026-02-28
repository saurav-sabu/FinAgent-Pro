"""
API router for FinAgent-Pro.

This module defines HTTP endpoints that expose the finance agent's capabilities,
including health checks and query analysis.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from backend.agent.schemas import HealthResponse, QueryRequest, QueryResponse
from backend.utils.logger import logger

router = APIRouter()

# Global reference to the FinanceAgent instance injected from the application
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


@router.post("/analyze", response_model=QueryResponse, tags=["Analysis"])
async def analyze(request: Request, body: QueryRequest) -> QueryResponse:
    """
    Analyze a financial query using the injected FinanceAgent.

    Args:
        request (Request): Incoming FastAPI request object (reserved for future use,
                           e.g., logging or correlation IDs).
        body (QueryRequest): Validated request body containing the user query.

    Returns:
        QueryResponse: Contains the original query and the AI-generated analysis.

    Raises:
        HTTPException: If the finance agent has not yet been initialized.
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
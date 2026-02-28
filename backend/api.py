"""
FastAPI application entrypoint for FinAgent-Pro.

This module:
- Verifies required environment configuration at startup.
- Initializes the FinanceAgent and injects it into the router.
- Exposes the FastAPI `app` instance for use by ASGI servers (e.g., uvicorn).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.agent.controller import FinanceAgent
from backend.agent.router import router, set_agent
from backend.utils.logger import logger
from backend.utils.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.

    Performs one-time startup checks and initializes the FinanceAgent instance,
    then injects it into the router so that endpoints can use it.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    logger.info("Verifying environment requirements...")
    if not settings.ANTHROPIC_API_KEY:
        logger.error("ANTHROPIC_API_KEY is missing from settings.")
        raise RuntimeError(
            "ANTHROPIC_API_KEY not found. Set it in your .env file"
        )

    logger.info("Initializing FinanceAgent (this might take a moment)...")
    agent_instance = FinanceAgent()

    # Inject the initialized agent into the router module
    set_agent(agent_instance)

    logger.info("Finance Agent initialized and injected into router.")
    logger.info("FinAgent-Pro is ready - API is live.")

    # Hand control back to FastAPI to run the application
    yield

    # Shutdown phase (executed when the application stops)
    logger.info("Shutting down the Finance Agent.")


logger.info("Creating FastAPI application instance...")

app = FastAPI(
    title="FinAgent-Pro",
    description="AI-powered market analysis powered by YFinance",
    version="1.0.0",
    lifespan=lifespan,
)

# Register the agent-related routes with the application
app.include_router(router)


"""
FastAPI application entrypoint for FinAgent-Pro.

This module:
- Verifies required environment configuration at startup.
- Initializes the FinanceAgent and injects it into the router.
- Exposes the FastAPI `app` instance for use by ASGI servers (e.g., uvicorn).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.agent.controller import FinanceAgent
from backend.agent.router import router, set_agent
from backend.agent.auth_router import router as auth_router
from backend.agent.analytics_router import router as analytics_router
from backend.agent.watchlist_router import router as watchlist_router
from backend.agent.portfolio_router import router as portfolio_router
from backend.database import engine
from backend import models
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

    logger.info("Initializing NeonDB (PostgreSQL) Database schema...")
    async with engine.begin() as conn:
        # Create all tables securely against the cloud instance
        await conn.run_sync(models.Base.metadata.create_all)
        
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

# Allow browser/frontend requests from other origins (e.g. React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "FinAgent-Pro API is running. Access the frontend at your Vercel URL or hit /api for endpoints.",
        "documentation": "/docs"
    }

# Register the agent-related routes with the application
app.include_router(auth_router, prefix="/api")
app.include_router(router, prefix="/api")
app.include_router(analytics_router)
app.include_router(watchlist_router)
app.include_router(portfolio_router)



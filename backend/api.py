import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from backend.agent.controller import FinanceAgent
from backend.agent.router import router,set_agent
from backend.utils.settings import settings
from backend.utils.logger import logger

@asynccontextmanager
async def lifespan(app:FastAPI):
    logger.info("Verifying environment requirements...")
    if not settings.ANTHROPIC_API_KEY:
        logger.error("ANTHROPIC_API_KEY is missing from settings.")
        raise RuntimeError("ANTHROPIC_API_KEY not found. Set it in your .env file")
    

    logger.info("Initializing FinanceAgent (this might take a moment)....")
    agent_instance = FinanceAgent()

    set_agent(agent_instance)

    logger.info("Finance Agent initialized and injected into router.")
    logger.info("Finance ready - API is live")

    yield

    logger.info("Shutting down the Finance Agent")


logger.info("Creating FastAPI application instance...")

app = FastAPI(
    title="FinAgent-Pro",
    description="AI-powered market analysis powered by YFinance",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(router)


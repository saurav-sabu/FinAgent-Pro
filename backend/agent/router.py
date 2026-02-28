from fastapi import APIRouter, HTTPException, Request

from backend.agent.schemas import QueryRequest, QueryResponse, HealthResponse
from backend.utils.logger import logger

router = APIRouter()

agent = None

def set_agent(instance):
    global agent
    agent = instance

@router.get("/health",response_model=HealthResponse,tags=["System"])
async def health_check():
    logger.info("Health check requested.")
    return HealthResponse(status="ok",agent_ready=agent is not None)

@router.post("/analyze",response_model=QueryResponse, tags=["Analysis"])
async def analyze(request:Request,body:QueryRequest):
    if agent is not None:
        logger.error("Analysis requested but agent is not initialized.")
        raise HTTPException(status_code=503,detail="Agent not intialized. Server may still be starting up")
    
    logger.info(f"Received analysis request for query: {body.query[:50]}...")
    result = await agent.analyze(body.query)

    logger.info("Analysis request completed successfully")
    return QueryResponse(query=body.query,response=result)
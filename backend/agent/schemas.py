from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    query : str = Field(...,
                        min_length=1,
                        max_length=1000,
                        description="Queries about stocks, sectors or markets",
                        json_schema_extra={"examples":["Analyze AAPL","Compare TSLA and NVDA"]})
    
class QueryResponse(BaseModel):
    query: str = Field(description="The original query")
    response: str = Field(description="The AI-generated analysis")

class HealthResponse(BaseModel):
    status: str
    agent_ready: bool 
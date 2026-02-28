"""
Pydantic schemas for API request and response models.

This module defines the data structures used for:
- API request validation (QueryRequest)
- API response formatting (QueryResponse, HealthResponse)
"""

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """
    Request schema for financial analysis queries.
    
    Validates user input for financial queries with length constraints
    and provides example queries for API documentation.
    
    Attributes:
        query (str): Financial query string (1-1000 characters).
                    Examples: "Analyze AAPL", "Compare TSLA and NVDA"
    """
    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Queries about stocks, sectors or markets",
        json_schema_extra={"examples": ["Analyze AAPL", "Compare TSLA and NVDA"]}
    )


class QueryResponse(BaseModel):
    """
    Response schema for financial analysis results.
    
    Contains both the original query and the AI-generated analysis response.
    
    Attributes:
        query (str): The original user query that was processed.
        response (str): The AI-generated financial analysis in markdown format.
    """
    query: str = Field(description="The original query")
    response: str = Field(description="The AI-generated analysis")


class HealthResponse(BaseModel):
    """
    Health check response schema.
    
    Used for API health/status endpoints to indicate system availability
    and agent readiness.
    
    Attributes:
        status (str): Overall system status (e.g., "healthy", "unhealthy").
        agent_ready (bool): Whether the finance agent is initialized and ready.
    """
    status: str
    agent_ready: bool
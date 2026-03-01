"""
Pydantic schemas for API request and response models.

Defines data structures for:
- Finance: QueryRequest, QueryResponse, HealthResponse
- News: NewsRegion, NewsItem, NewsResponse, NewsFilterRequest
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict,Any

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


class NewsRegion(str, Enum):
    """Region filter for market news: US, India, or global."""

    US = "US"
    INDIA = "INDIA"
    GLOBAL = "GLOBAL"


class NewsItem(BaseModel):
    """
    Single news article with citation fields (url, source, published_date).
    """

    title: str
    description: Optional[str] = None
    url: str
    source: str
    published_date: datetime
    tickers: List[str] = Field(
        default_factory=list,
        description="Related stock tickers, if available",
    )
    sentiment: Optional[str] = Field(
        default=None,
        description="Optional sentiment label: Positive, Negative, or Neutral",
    )


class NewsResponse(BaseModel):
    """Paginated news response with region, items list, and total count."""

    region: NewsRegion
    items: List[NewsItem]
    total_results: int


class NewsFilterRequest(BaseModel):
    """Request body or query params for filtering news by region, ticker, and limit."""

    region: NewsRegion = Field(
        default=NewsRegion.GLOBAL, description="Filter news by region"
    )
    ticker: Optional[str] = Field(None, description="Stock ticker symbol (e.g. AAPL)")
    limit: int = Field(default=10, ge=1, le=50)


class MarketIndex(BaseModel):
    name: str
    change_percent: float

class TrendingStock(BaseModel):
    ticker:str
    price:float
    change_percent:float

class StockDetails(BaseModel):
    ticker:str
    price:float
    change:float
    change_percent:float
    open:float
    previous_close:float
    day_high:float
    day_low:float
    volume:int

class RiskAnalysis(BaseModel):
    score: int
    level:str
    reasons: List[str]
    rsi: float
    volatility: float
    beta: float

class DashboardResponse(BaseModel):
    indices: Dict[str,float]
    trending: Dict[str,List[TrendingStock]]
    stock_lookup: StockDetails
    risk_score: RiskAnalysis
    volume_alert: bool
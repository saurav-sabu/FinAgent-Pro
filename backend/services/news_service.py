"""
News service module for FinAgent-Pro.

Fetches latest stock and market news from external APIs (NewsAPI and MarketAux),
normalizes responses into NewsItem models, and supports region and ticker filters.
"""

import httpx
from typing import List, Optional

from backend.agent.schemas import NewsItem, NewsRegion
from backend.utils.logger import logger
from backend.utils.settings import settings


class NewsService:
    """
    Service for fetching latest market news from external providers.

    Uses:
    - NewsAPI for India-specific or general business news
    - MarketAux for US/global financial news
    """

    def __init__(self) -> None:
        """Load API keys from settings for NewsAPI and MarketAux."""
        self.newsapi_key = settings.NEWSAPI_KEY
        self.marketaux_api_key = settings.MARKETAUX_API_KEY

    async def get_market_news(
        self,
        region: NewsRegion,
        ticker: Optional[str] = None,
        limit: int = 10,
    ) -> list[NewsItem]:
        """
        Fetch market news based on region and optional ticker.

        For India, uses NewsAPI. For other regions (US/GLOBAL), uses MarketAux.
        """
        if region == NewsRegion.INDIA:
            return await self._fetch_from_news(region, ticker, limit)
        else:
            return await self._fetch_from_marketaux(region, ticker, limit)

    async def _fetch_from_news(
        self,
        region: NewsRegion,
        ticker: Optional[str],
        limit: int,
    ) -> list[NewsItem]:
        """
        Fetch news from NewsAPI (used for India region).

        Without ticker: uses top-headlines (business, country=in).
        With ticker: uses everything search with a combined query.
        """
        url = "https://newsapi.org/v2/top-headlines"
        params = {
            "apiKey": self.newsapi_key,
            "category": "business",
            "country": "in",
            "pageSize": limit,
        }

        if ticker:
            url = "https://newsapi.org/v2/everything"
            params = {
                "apiKey": self.newsapi_key,
                "q": f"{ticker} AND (stock OR market OR finance)",
                "sortBy": "publishedAt",
                "language": "en",
                "pageSize": limit,
            }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                articles = data.get("articles", [])
                news_items: list[NewsItem] = []

                for article in articles:
                    if article.get("title") == "[Removed]":
                        continue
                    news_items.append(
                        NewsItem(
                            title=article.get("title") or "",
                            description=article.get("description"),
                            url=article.get("url") or "",
                            source=(article.get("source") or {}).get("name", "NewsAPI"),
                            published_date=article.get("publishedAt"),
                        )
                    )
                return news_items
            except Exception as e:
                logger.error("Error fetching from NewsAPI: %s", e)
                return []

    async def _fetch_from_marketaux(
        self,
        region: NewsRegion,
        ticker: Optional[str],
        limit: int,
    ) -> list[NewsItem]:
        """
        Fetch news from MarketAux (used for US and GLOBAL regions).

        MarketAux expects api_token and symbols (plural). See:
        https://marketaux.com/documentation
        """
        url = "https://api.marketaux.com/v1/news/all"
        params: dict = {
            "api_token": self.marketaux_api_key,
            "language": "en",
            "limit": limit,
        }
        if region == NewsRegion.US:
            params["countries"] = "us"
        if ticker:
            params["symbols"] = ticker

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                data_items = data.get("data", [])
                news_items: list[NewsItem] = []

                for item in data_items:
                    pub_raw = item.get("published_at") or item.get("publishedAt")
                    if not pub_raw:
                        continue
                    news_items.append(
                        NewsItem(
                            title=item.get("title") or "",
                            description=item.get("description"),
                            url=item.get("url") or "",
                            source=item.get("source") or "MarketAux",
                            published_date=pub_raw,
                        )
                    )
                return news_items
            except httpx.HTTPStatusError as e:
                logger.error(
                    "MarketAux API error: status=%s response=%s",
                    e.response.status_code,
                    e.response.text[:500],
                )
                return []
            except Exception as e:
                logger.error("Error fetching from MarketAux: %s", e, exc_info=True)
                return []


# Shared service instance for use in routers
news_service = NewsService()
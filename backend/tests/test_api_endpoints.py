import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Verify health endpoint is reachable."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_dashboard_authenticated(authed_client: AsyncClient):
    """Verify authenticated dashboard access."""
    response = await authed_client.get("/api/dashboard?ticker=AAPL")
    assert response.status_code == 200
    data = response.json()
    assert "indices" in data
    assert "stock_lookup" in data
    assert data["stock_lookup"]["ticker"] == "AAPL"

@pytest.mark.asyncio
async def test_watchlist_toggle(authed_client: AsyncClient):
    """Verify adding and removing from watchlist."""
    ticker = "MSFT"
    # Add
    resp = await authed_client.post("/api/watchlist", json={"ticker": ticker})
    assert resp.status_code == 200
    assert resp.json()["status"] == "added"
    
    # Verify in watchlist
    resp = await authed_client.get("/api/watchlist")
    assert any(item["ticker"] == ticker for item in resp.json())
    
    # Remove (Toggle)
    resp = await authed_client.post("/api/watchlist", json={"ticker": ticker})
    assert resp.status_code == 200
    assert resp.json()["status"] == "removed"

@pytest.mark.asyncio
async def test_portfolio_transaction(authed_client: AsyncClient):
    """Verify recording a portfolio transaction."""
    transaction = {
        "ticker": "NVDA",
        "type": "BUY",
        "shares": 10,
        "price": 100.0,
        "date": "2024-03-01"
    }
    resp = await authed_client.post("/api/portfolio/transaction", json=transaction)
    assert resp.status_code == 200
    
    # Verify in summary
    resp = await authed_client.get("/api/portfolio/summary")
    assert resp.status_code == 200
    holdings = resp.json()["holdings"]
    assert any(h["ticker"] == "NVDA" for h in holdings)

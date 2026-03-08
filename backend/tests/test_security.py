import pytest
from httpx import AsyncClient
from backend.api import app
from backend.utils.auth import create_refresh_token
import time

@pytest.mark.asyncio
async def test_password_complexity_failure(async_client: AsyncClient):
    """Test that weak passwords fail registration"""
    response = await async_client.post("/api/auth/register", json={
        "email": "weak@test.com",
        "password": "123",
        "name": "Weak User"
    })
    assert response.status_code == 422
    assert "at least 8 characters" in response.text

@pytest.mark.asyncio
async def test_password_complexity_missing_upper(async_client: AsyncClient):
    response = await async_client.post("/api/auth/register", json={
        "email": "noupper@test.com",
        "password": "password123",
        "name": "No Upper"
    })
    assert response.status_code == 422
    assert "uppercase" in response.text

@pytest.mark.asyncio
async def test_ticker_sanitization_failure(async_client: AsyncClient, auth_headers):
    """Test that invalid ticker formats fail"""
    response = await async_client.get("/api/dashboard?ticker=INVALID-TICKER", headers=auth_headers)
    assert response.status_code == 422

    assert "match pattern" in response.text

@pytest.mark.asyncio
async def test_refresh_token_flow(async_client: AsyncClient, test_user):
    """Test the refresh token exchange flow"""
    # 1. Login to get initial tokens
    response = await async_client.post("/api/auth/login", data={
        "username": test_user.email,
        "password": "TestPassword123"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "refresh_token" in data
    refresh_token = data["refresh_token"]
    
    # 2. Extract access token to verify it's valid
    access_token = data["access_token"]
    
    # 3. Refresh
    refresh_response = await async_client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_response.status_code == 200, f"Refresh failed: {refresh_response.text}"
    new_data = refresh_response.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["access_token"] != access_token

@pytest.mark.asyncio
async def test_rate_limiting(async_client: AsyncClient):
    """Test that rate limiting triggers after too many attempts (Run last)"""
    import os
    if os.getenv("TEST_MODE") == "true":
        pytest.skip("Skipping rate limit test in TEST_MODE")
        
    for _ in range(25):
        response = await async_client.post("/api/auth/login", data={
            "username": "test@test.com",
            "password": "WrongPassword123"
        })
    
    assert response.status_code == 429

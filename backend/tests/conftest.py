import pytest
import asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from backend.api import app
from backend.database import engine as global_engine

@pytest.fixture(scope="session", autouse=True)
async def manage_engine():
    yield
    await global_engine.dispose()
@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def authed_client(async_client):
    """Returns a client pre-authenticated with a fresh test user."""
    test_id = str(uuid.uuid4())[:8]
    email = f"test_{test_id}@example.com"
    password = "Password123!"
    
    # Register
    await async_client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "name": "Test User"
    })
    
    # Login
    login_resp = await async_client.post("/api/auth/login", data={
        "username": email,
        "password": password
    })
    token = login_resp.json()["access_token"]
    
    # Set header
    async_client.headers["Authorization"] = f"Bearer {token}"
    return async_client

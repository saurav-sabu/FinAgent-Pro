import pytest
import asyncio
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

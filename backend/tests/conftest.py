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
@pytest.fixture
async def test_user(async_client):
    """Creates a test user for auth tests."""
    test_id = str(uuid.uuid4())[:8]
    email = f"test_{test_id}@test.com"
    password = "TestPassword123"
    name = "Test User"
    
    # Check if user exists, if not register
    resp = await async_client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "name": name
    })
    if resp.status_code != 200:
        print(f"Registration failed in test_user: {resp.text}")
    
    # Store email for auth_headers to use
    async_client.test_email = email 
    
    from backend.models import User
    from backend.database import engine
    from sqlalchemy.future import select
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == email))
        return result.scalars().first()

@pytest.fixture
async def auth_headers(async_client, test_user):
    """Returns headers for an authenticated test user."""
    email = getattr(async_client, "test_email", "test@test.com")
    login_resp = await async_client.post("/api/auth/login", data={
        "username": email,
        "password": "TestPassword123"
    })
    if login_resp.status_code != 200:
        print(f"Login failed in auth_headers for {email}: {login_resp.text}")
        raise Exception(f"Login failed: {login_resp.text}")
        
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

import pytest
import uuid

@pytest.mark.asyncio
async def test_register_user(async_client):
    email = f"test_{uuid.uuid4().hex}@example.com"
    response = await async_client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "testpassword123",
            "name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert "id" in data

@pytest.mark.asyncio
async def test_login_user(async_client):
    # First register
    email = f"test_{uuid.uuid4().hex}@example.com"
    password = "testpassword123"
    await async_client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Test User"
        }
    )
    
    # Then login
    response = await async_client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": password
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

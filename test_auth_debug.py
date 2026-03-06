import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        try:
            # Try to register a unique user
            response = await client.post("/auth/register", json={
                "name": "Test User",
                "email": "unique_email_123@example.com",
                "password": "password123"
            })
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

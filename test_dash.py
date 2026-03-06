import asyncio
from backend.services.dashboard_service import dashboard_service

async def main():
    try:
        data = await dashboard_service.get_dashboard_data("AAPL")
        print("SUCCESS:", data)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

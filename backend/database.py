from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.utils.settings import settings

# Parse the DATABASE_URL. If Neon gave postgres://, asyncpg needs postgresql+asyncpg://
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
# Strip all query parameters as they cause issues with asyncpg
if "?" in db_url:
    db_url = db_url.split("?")[0]

# Initialize the async engine
engine = create_async_engine(
    db_url,
    connect_args={"ssl": "require"},
    echo=False,  # Set to True for SQL request logging
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Base class for the SQLAlchemy declarative models
Base = declarative_base()

async def get_db():
    """ Fastapi dependency to yield a database session """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

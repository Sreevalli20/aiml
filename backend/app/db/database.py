from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# Base class for models
Base = declarative_base()

# Global engine and session factory (initialized lazily)
_engine = None
_AsyncSessionLocal = None


def get_engine():
    """Get or create the async engine (lazy initialization)."""
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.async_database_url,
            echo=settings.debug,
            future=True
        )
    return _engine


def get_session_factory():
    """Get or create the async session factory (lazy initialization)."""
    global _AsyncSessionLocal
    if _AsyncSessionLocal is None:
        _AsyncSessionLocal = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
    return _AsyncSessionLocal


# Module-level variables for backward compatibility (will be initialized on first access)
class _LazyEngine:
    """Lazy engine proxy that only initializes on first access."""
    def __getattr__(self, name):
        return getattr(get_engine(), name)
    
    def begin(self):
        return get_engine().begin()


class _LazySessionFactory:
    """Lazy session factory proxy that only initializes on first access."""
    def __call__(self, *args, **kwargs):
        return get_session_factory()(*args, **kwargs)
    
    def __getattr__(self, name):
        return getattr(get_session_factory(), name)


engine = _LazyEngine()
AsyncSessionLocal = _LazySessionFactory()


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database - creates all tables."""
    eng = get_engine()
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

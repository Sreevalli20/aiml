from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

from app.db import get_db
from app.schemas.common import HealthResponse
from app.config import settings

router = APIRouter()


@router.get("", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint."""
    db_connected = False
    
    try:
        # Test database connection
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False
    
    return HealthResponse(
        success=True,
        status="healthy" if db_connected else "degraded",
        school="XYZ AI International Academy",
        version=settings.app_version,
        timestamp=datetime.utcnow(),
        database_connected=db_connected
    )

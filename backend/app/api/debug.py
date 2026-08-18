from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
from app.models.user import User
from app.security.password import verify_password

router = APIRouter()

@router.get("/password-check")
async def check_password(db: AsyncSession = Depends(get_db)):
    """Debug endpoint to check password verification"""
    result = await db.execute(select(User).where(User.email == "rahul.sharma@greenwood.edu"))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"error": "User not found"}
    
    # Test password verification
    is_valid = verify_password("student123", user.hashed_password)
    
    return {
        "email": user.email,
        "hash_preview": user.hashed_password[:50],
        "password_valid": is_valid,
        "is_active": user.is_active
    }

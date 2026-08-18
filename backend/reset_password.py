import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import AsyncSessionLocal
from app.models.user import User
from app.security.password import get_password_hash

async def reset_password():
    """Reset password for rahul.sharma@greenwood.edu"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "rahul.sharma@greenwood.edu"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("User not found!")
            return
        
        print(f"Found user: {user.email}")
        print(f"Current hash: {user.hashed_password[:50]}...")
        
        # Update password
        user.hashed_password = get_password_hash("student123")
        await db.commit()
        
        print("Password updated successfully!")
        print(f"New hash: {user.hashed_password[:50]}...")

if __name__ == "__main__":
    asyncio.run(reset_password())

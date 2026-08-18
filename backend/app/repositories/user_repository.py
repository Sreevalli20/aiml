from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def get_by_identifier(self, identifier: str) -> Optional[User]:
        """Get user by email or username."""
        result = await self.db.execute(
            select(User).where(
                (User.email == identifier) | (User.username == identifier)
            )
        )
        return result.scalar_one_or_none()
    
    async def get_by_role(self, role: UserRole, limit: int = 100) -> list[User]:
        """Get users by role."""
        result = await self.db.execute(
            select(User).where(User.role == role).limit(limit)
        )
        return result.scalars().all()

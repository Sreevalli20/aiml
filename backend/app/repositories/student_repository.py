from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.student import Student
from app.models.user import User
from app.repositories.base import BaseRepository


class StudentRepository(BaseRepository[Student]):
    def __init__(self, db: AsyncSession):
        super().__init__(Student, db)
    
    async def get_by_user_id(self, user_id: str) -> Optional[Student]:
        """Get student by user ID."""
        result = await self.db.execute(
            select(Student).where(Student.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_roll_number(self, roll_number: str) -> Optional[Student]:
        """Get student by roll number."""
        result = await self.db.execute(
            select(Student).where(Student.roll_number == roll_number)
        )
        return result.scalar_one_or_none()
    
    async def get_with_user(self, student_id: str) -> Optional[Student]:
        """Get student with user data."""
        result = await self.db.execute(
            select(Student)
            .options(selectinload(Student.user))
            .where(Student.id == student_id)
        )
        return result.scalar_one_or_none()
    
    async def search_by_name(self, name: str, limit: int = 20) -> list[Student]:
        """Search students by name (via user)."""
        result = await self.db.execute(
            select(Student)
            .join(User)
            .where(User.full_name.ilike(f"%{name}%"))
            .limit(limit)
        )
        return result.scalars().all()

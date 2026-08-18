from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.parent import Parent
from app.models.student_parent_relationship import StudentParentRelationship
from app.models.student import Student
from app.repositories.base import BaseRepository


class ParentRepository(BaseRepository[Parent]):
    def __init__(self, db: AsyncSession):
        super().__init__(Parent, db)
    
    async def get_by_user_id(self, user_id: str) -> Optional[Parent]:
        """Get parent by user ID."""
        result = await self.db.execute(
            select(Parent).where(Parent.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_children(self, parent_id: str) -> list[Student]:
        """Get all children for a parent."""
        result = await self.db.execute(
            select(Student)
            .join(StudentParentRelationship)
            .where(StudentParentRelationship.parent_id == parent_id)
        )
        return result.scalars().all()
    
    async def get_with_user(self, parent_id: str) -> Optional[Parent]:
        """Get parent with user data."""
        result = await self.db.execute(
            select(Parent)
            .options(selectinload(Parent.user))
            .where(Parent.id == parent_id)
        )
        return result.scalar_one_or_none()

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.teacher import Teacher
from app.models.teacher_class_assignment import TeacherClassAssignment
from app.models.class_model import ClassModel
from app.repositories.base import BaseRepository


class TeacherRepository(BaseRepository[Teacher]):
    def __init__(self, db: AsyncSession):
        super().__init__(Teacher, db)
    
    async def get_by_user_id(self, user_id: str) -> Optional[Teacher]:
        """Get teacher by user ID."""
        result = await self.db.execute(
            select(Teacher).where(Teacher.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_employee_id(self, employee_id: str) -> Optional[Teacher]:
        """Get teacher by employee ID."""
        result = await self.db.execute(
            select(Teacher).where(Teacher.employee_id == employee_id)
        )
        return result.scalar_one_or_none()
    
    async def get_assigned_classes(self, teacher_id: str) -> list[ClassModel]:
        """Get all classes assigned to a teacher."""
        result = await self.db.execute(
            select(ClassModel)
            .join(TeacherClassAssignment)
            .where(TeacherClassAssignment.teacher_id == teacher_id)
        )
        return result.scalars().all()
    
    async def get_with_user(self, teacher_id: str) -> Optional[Teacher]:
        """Get teacher with user data."""
        result = await self.db.execute(
            select(Teacher)
            .options(selectinload(Teacher.user))
            .where(Teacher.id == teacher_id)
        )
        return result.scalar_one_or_none()

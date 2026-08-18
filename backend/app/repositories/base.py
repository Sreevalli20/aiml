from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

from app.db import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get_by_id(self, id: str) -> Optional[ModelType]:
        """Get a record by ID."""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[ModelType]:
        """Get all records with pagination."""
        result = await self.db.execute(
            select(self.model).limit(limit).offset(offset)
        )
        return result.scalars().all()
    
    async def create(self, **kwargs) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**kwargs)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(self, id: str, **kwargs) -> Optional[ModelType]:
        """Update a record."""
        result = await self.db.execute(
            update(self.model).where(self.model.id == id).values(**kwargs).returning(self.model)
        )
        await self.db.flush()
        return result.scalar_one_or_none()
    
    async def delete(self, id: str) -> bool:
        """Delete a record."""
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.db.flush()
        return result.rowcount > 0
    
    async def exists(self, id: str) -> bool:
        """Check if a record exists."""
        result = await self.db.execute(
            select(self.model.id).where(self.model.id == id)
        )
        return result.scalar_one_or_none() is not None

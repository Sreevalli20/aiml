from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.escalation import EscalationRequest, EscalationStatus, EscalationType
from app.repositories.base import BaseRepository


class EscalationRepository(BaseRepository[EscalationRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(EscalationRequest, db)
    
    async def get_by_requested_by(self, user_id: str, limit: int = 50) -> List[EscalationRequest]:
        """Get escalations requested by a user."""
        result = await self.db.execute(
            select(EscalationRequest)
            .where(EscalationRequest.requested_by == user_id)
            .order_by(EscalationRequest.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(self, status: EscalationStatus, limit: int = 50) -> List[EscalationRequest]:
        """Get escalations by status."""
        result = await self.db.execute(
            select(EscalationRequest)
            .where(EscalationRequest.status == status)
            .order_by(EscalationRequest.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_type(self, escalation_type: EscalationType, limit: int = 50) -> List[EscalationRequest]:
        """Get escalations by type."""
        result = await self.db.execute(
            select(EscalationRequest)
            .where(EscalationRequest.escalation_type == escalation_type)
            .order_by(EscalationRequest.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.escalation import EscalationRequest, EscalationType, EscalationStatus
from app.repositories.escalation_repository import EscalationRepository
from app.security.authorization import AuthorizationError


class EscalationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.escalation_repo = EscalationRepository(db)
    
    async def create_escalation(
        self,
        requested_by: str,
        escalation_type: EscalationType,
        reason: str,
        target_user_id: str = None,
        student_id: str = None,
        contact_number: str = None
    ) -> EscalationRequest:
        """Create an escalation request."""
        escalation = EscalationRequest(
            requested_by=requested_by,
            escalation_type=escalation_type,
            target_user_id=target_user_id,
            student_id=student_id,
            reason=reason,
            contact_number=contact_number,
            status=EscalationStatus.SUBMITTED
        )
        
        self.db.add(escalation)
        await self.db.flush()
        await self.db.refresh(escalation)
        
        return escalation
    
    async def get_user_escalations(self, user_id: str) -> list[EscalationRequest]:
        """Get escalations requested by a user."""
        return await self.escalation_repo.get_by_requested_by(user_id)
    
    async def update_status(
        self,
        escalation_id: str,
        status: EscalationStatus
    ) -> EscalationRequest:
        """Update escalation status."""
        escalation = await self.escalation_repo.get_by_id(escalation_id)
        if not escalation:
            raise AuthorizationError("Escalation not found")
        
        escalation.status = status
        if status == EscalationStatus.COMPLETED:
            from datetime import datetime
            escalation.completed_at = datetime.utcnow()
        
        await self.db.flush()
        await self.db.refresh(escalation)
        return escalation

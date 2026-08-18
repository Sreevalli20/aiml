from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog, AuditAction
from app.repositories.audit_log_repository import AuditLogRepository


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit_repo = AuditLogRepository(db)
    
    async def log_action(
        self,
        user_id: str,
        user_role: str,
        action: AuditAction,
        resource_type: str = None,
        resource_id: str = None,
        details: dict = None,
        ip_address: str = None,
        user_agent: str = None,
        success: bool = True,
        correlation_id: str = None
    ) -> AuditLog:
        """Create an audit log entry."""
        return await self.audit_repo.create_log(
            user_id=user_id,
            user_role=user_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            correlation_id=correlation_id
        )
    
    async def log_security_event(
        self,
        user_id: str,
        user_role: str,
        event_type: str,
        details: dict = None,
        ip_address: str = None
    ) -> AuditLog:
        """Log a security event."""
        return await self.audit_repo.create_log(
            user_id=user_id,
            user_role=user_role,
            action=AuditAction.SECURITY_EVENT,
            resource_type="security",
            details={"event_type": event_type, **(details or {})},
            ip_address=ip_address,
            success=False
        )
    
    async def log_authorization_denied(
        self,
        user_id: str,
        user_role: str,
        resource_type: str,
        reason: str,
        ip_address: str = None
    ) -> AuditLog:
        """Log a denied authorization attempt."""
        return await self.audit_repo.create_log(
            user_id=user_id,
            user_role=user_role,
            action=AuditAction.AUTHORIZATION_DENIED,
            resource_type=resource_type,
            details={"reason": reason},
            ip_address=ip_address,
            success=False
        )

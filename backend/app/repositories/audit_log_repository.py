from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta

from app.models.audit_log import AuditLog, AuditAction
from app.repositories.base import BaseRepository


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(AuditLog, db)
    
    async def create_log(
        self,
        user_id: str,
        user_role: str,
        action: AuditAction,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        correlation_id: Optional[str] = None
    ) -> AuditLog:
        """Create an audit log entry."""
        log = AuditLog(
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
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log
    
    async def get_user_logs(
        self,
        user_id: str,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs for a specific user."""
        result = await self.db.execute(
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_action_logs(
        self,
        action: AuditAction,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs for a specific action."""
        result = await self.db.execute(
            select(AuditLog)
            .where(AuditLog.action == action)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_security_events(
        self,
        hours: int = 24,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get recent security events."""
        since = datetime.utcnow() - timedelta(hours=hours)
        result = await self.db.execute(
            select(AuditLog)
            .where(
                and_(
                    AuditLog.action == AuditAction.SECURITY_EVENT,
                    AuditLog.created_at >= since
                )
            )
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_failed_authorizations(
        self,
        hours: int = 24,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get failed authorization attempts."""
        since = datetime.utcnow() - timedelta(hours=hours)
        result = await self.db.execute(
            select(AuditLog)
            .where(
                and_(
                    AuditLog.action == AuditAction.AUTHORIZATION_DENIED,
                    AuditLog.created_at >= since
                )
            )
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

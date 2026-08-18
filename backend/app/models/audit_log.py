from sqlalchemy import Column, String, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db import Base
import enum


class AuditAction(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    ATTENDANCE_VIEW = "attendance_view"
    ATTENDANCE_MARK = "attendance_mark"
    ATTENDANCE_UPDATE = "attendance_update"
    ANALYTICS_VIEW = "analytics_view"
    ESCALATION_CREATED = "escalation_created"
    AUTHORIZATION_DENIED = "authorization_denied"
    SECURITY_EVENT = "security_event"
    CONVERSATION_CREATED = "conversation_created"
    CONVERSATION_MESSAGE = "conversation_message"


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_role = Column(String, nullable=False, index=True)
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    resource_type = Column(String, nullable=True)  # e.g., "attendance", "student", "escalation"
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    success = Column(String, default=True, nullable=False)
    correlation_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

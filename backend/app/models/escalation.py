from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class EscalationType(str, enum.Enum):
    TEACHER = "teacher"
    MANAGEMENT = "management"


class EscalationStatus(str, enum.Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class EscalationRequest(Base):
    __tablename__ = "escalation_requests"
    
    id = Column(String, primary_key=True, index=True)
    requested_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    escalation_type = Column(SQLEnum(EscalationType), nullable=False)
    target_user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Teacher or manager being escalated to
    student_id = Column(String, ForeignKey("students.id"), nullable=True)
    reason = Column(Text, nullable=False)
    contact_number = Column(String)
    status = Column(SQLEnum(EscalationStatus), default=EscalationStatus.PENDING, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

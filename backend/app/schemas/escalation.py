from pydantic import BaseModel, Field
from typing import Optional
from app.models.escalation import EscalationType, EscalationStatus


class EscalationCreate(BaseModel):
    escalation_type: EscalationType
    target_user_id: Optional[str] = None
    student_id: Optional[str] = None
    reason: str = Field(..., min_length=1)
    contact_number: Optional[str] = None


class EscalationResponse(BaseModel):
    id: str
    escalation_type: EscalationType
    status: EscalationStatus
    reason: str
    created_at: str
    
    class Config:
        from_attributes = True


class EscalationListResponse(BaseModel):
    escalations: list[EscalationResponse]

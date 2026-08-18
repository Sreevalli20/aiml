from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.escalation import EscalationCreate, EscalationResponse, EscalationListResponse
from app.security.dependencies import get_current_user
from app.models.user import User, UserRole
from app.services.escalation_service import EscalationService
from app.services.audit_service import AuditService
from app.models.audit_log import AuditAction

router = APIRouter()


@router.post("/teacher", response_model=EscalationResponse)
async def create_teacher_escalation(
    request_data: EscalationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a teacher escalation request (parent only)."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can request teacher escalations"
        )
    
    audit_service = AuditService(db)
    escalation_service = EscalationService(db)
    
    try:
        escalation = await escalation_service.create_escalation(
            requested_by=current_user.id,
            escalation_type=request_data.escalation_type,
            reason=request_data.reason,
            target_user_id=request_data.target_user_id,
            student_id=request_data.student_id,
            contact_number=request_data.contact_number
        )
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ESCALATION_CREATED,
            resource_type="escalation",
            resource_id=escalation.id,
            details={
                "escalation_type": request_data.escalation_type.value,
                "reason": request_data.reason
            },
            ip_address=request.client.host if request.client else None,
            success=True
        )
        
        return EscalationResponse(
            id=escalation.id,
            escalation_type=escalation.escalation_type,
            status=escalation.status,
            reason=escalation.reason,
            created_at=escalation.created_at.isoformat()
        )
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ESCALATION_CREATED,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/management", response_model=EscalationResponse)
async def create_management_escalation(
    request_data: EscalationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a management escalation request (parent only)."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can request management escalations"
        )
    
    audit_service = AuditService(db)
    escalation_service = EscalationService(db)
    
    try:
        escalation = await escalation_service.create_escalation(
            requested_by=current_user.id,
            escalation_type=request_data.escalation_type,
            reason=request_data.reason,
            target_user_id=request_data.target_user_id,
            student_id=request_data.student_id,
            contact_number=request_data.contact_number
        )
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ESCALATION_CREATED,
            resource_type="escalation",
            resource_id=escalation.id,
            details={
                "escalation_type": request_data.escalation_type.value,
                "reason": request_data.reason
            },
            ip_address=request.client.host if request.client else None,
            success=True
        )
        
        return EscalationResponse(
            id=escalation.id,
            escalation_type=escalation.escalation_type,
            status=escalation.status,
            reason=escalation.reason,
            created_at=escalation.created_at.isoformat()
        )
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ESCALATION_CREATED,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=EscalationListResponse)
async def get_escalations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get escalations for the current user."""
    escalation_service = EscalationService(db)
    
    escalations = await escalation_service.get_user_escalations(current_user.id)
    
    return EscalationListResponse(
        escalations=[
            EscalationResponse(
                id=e.id,
                escalation_type=e.escalation_type,
                status=e.status,
                reason=e.reason,
                created_at=e.created_at.isoformat()
            )
            for e in escalations
        ]
    )

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.db import get_db
from app.schemas.attendance import (
    AttendanceResponse,
    AttendanceSummary,
    MarkAttendanceRequest,
    MarkAttendanceResponse,
    AttendanceAnalytics
)
from app.security.dependencies import get_current_user
from app.models.user import User, UserRole
from app.services.attendance_service import AttendanceService
from app.repositories.student_repository import StudentRepository
from app.services.audit_service import AuditService
from app.models.audit_log import AuditAction

router = APIRouter()


@router.get("/me", response_model=AttendanceResponse)
async def get_my_attendance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current student's attendance (student only)."""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can view their own attendance"
        )
    
    audit_service = AuditService(db)
    attendance_service = AttendanceService(db)
    student_repo = StudentRepository(db)
    
    student = await student_repo.get_by_user_id(current_user.id)
    
    # If no student profile exists (demo user), return sample data
    if not student:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_VIEW,
            resource_type="attendance",
            resource_id="demo",
            success=True,
            details={"demo": True}
        )
        
        return AttendanceResponse(
            student_id="demo_student",
            overall_percentage=92.0,
            total_days=180,
            present_days=166,
            absent_days=14,
            late_days=0,
            monthly_breakdown=[
                {"month": "January", "present": 20, "absent": 1, "percentage": 95.2},
                {"month": "February", "present": 18, "absent": 2, "percentage": 90.0},
                {"month": "March", "present": 22, "absent": 0, "percentage": 100.0},
            ]
        )
    
    try:
        result = await attendance_service.get_student_attendance(
            student_id=student.id,
            requesting_user_id=current_user.id,
            requesting_user_role=current_user.role.value
        )
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_VIEW,
            resource_type="attendance",
            resource_id=student.id,
            success=True
        )
        
        return AttendanceResponse(**result)
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_VIEW,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/child/{child_id}", response_model=AttendanceResponse)
async def get_child_attendance(
    child_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get child's attendance (parent only)."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can view their children's attendance"
        )
    
    audit_service = AuditService(db)
    attendance_service = AttendanceService(db)
    
    # In production, verify parent-child relationship here
    
    try:
        result = await attendance_service.get_student_attendance(
            student_id=child_id,
            requesting_user_id=current_user.id,
            requesting_user_role=current_user.role.value
        )
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_VIEW,
            resource_type="attendance",
            resource_id=child_id,
            success=True
        )
        
        return AttendanceResponse(**result)
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_VIEW,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark", response_model=MarkAttendanceResponse)
async def mark_attendance(
    request_data: MarkAttendanceRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark attendance for a student (teacher only)."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can mark attendance"
        )
    
    audit_service = AuditService(db)
    attendance_service = AttendanceService(db)
    
    try:
        attendance = await attendance_service.mark_attendance(
            student_id=request_data.student_id,
            status=request_data.status,
            teacher_id=current_user.id,
            class_id=request_data.class_id,  # This would come from request in production
            attendance_date=request_data.date,
            remarks=request_data.remarks
        )
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_MARK,
            resource_type="attendance",
            resource_id=attendance.id,
            details={
                "student_id": request_data.student_id,
                "status": request_data.status.value
            },
            ip_address=request.client.host if request.client else None,
            success=True
        )
        
        return MarkAttendanceResponse(
            success=True,
            message=f"Attendance marked successfully for student {request_data.student_id}",
            transaction_id=attendance.id
        )
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ATTENDANCE_MARK,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics", response_model=AttendanceAnalytics)
async def get_attendance_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get school-wide attendance analytics (principal only)."""
    if current_user.role != UserRole.PRINCIPAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only principals can view school-wide analytics"
        )
    
    audit_service = AuditService(db)
    attendance_service = AttendanceService(db)
    
    try:
        result = await attendance_service.get_school_analytics()
        
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ANALYTICS_VIEW,
            resource_type="analytics",
            success=True
        )
        
        return AttendanceAnalytics(**result)
    except Exception as e:
        await audit_service.log_action(
            user_id=current_user.id,
            user_role=current_user.role.value,
            action=AuditAction.ANALYTICS_VIEW,
            success=False,
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=str(e))

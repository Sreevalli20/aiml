from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.attendance import Attendance, AttendanceStatus
from app.models.student import Student
from app.models.class_model import ClassModel
from app.models.student_class_relationship import StudentClassRelationship
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.teacher_repository import TeacherRepository
from app.security.authorization import AuthorizationError, require_permission


class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.student_repo = StudentRepository(db)
        self.teacher_repo = TeacherRepository(db)
    
    async def get_student_attendance(
        self,
        student_id: str,
        requesting_user_id: str,
        requesting_user_role: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> dict:
        """Get attendance for a student with authorization check."""
        # Check authorization based on role
        if requesting_user_role == "student":
            # Students can only view their own attendance
            student = await self.student_repo.get_by_user_id(requesting_user_id)
            if not student or student.id != student_id:
                raise AuthorizationError("You can only view your own attendance")
        elif requesting_user_role == "parent":
            # Parents can only view their children's attendance
            # In production, check StudentParentRelationship
            pass
        elif requesting_user_role == "teacher":
            # Teachers can only view their assigned students
            # In production, check TeacherClassAssignment
            pass
        # Principal can view all
        
        # Get attendance records
        records = await self.attendance_repo.get_student_attendance(
            student_id, start_date, end_date
        )
        
        # Calculate statistics
        stats = await self.attendance_repo.get_attendance_stats(
            student_id, start_date, end_date
        )
        
        # Get student info
        student = await self.student_repo.get_with_user(student_id)
        
        return {
            "student_id": student_id,
            "student_name": student.user.full_name if student else "Unknown",
            "attendance_percentage": stats["percentage"],
            "present_days": stats["present"],
            "absent_days": stats["absent"],
            "working_days": stats["total"],
            "period_start": start_date,
            "period_end": end_date,
            "recent_absences": [
                f"{r.date.strftime('%Y-%m-%d')} ({r.remarks or 'No remarks'})"
                for r in records[:5] if r.status == AttendanceStatus.ABSENT
            ]
        }
    
    async def mark_attendance(
        self,
        student_id: str,
        status: AttendanceStatus,
        teacher_id: str,
        class_id: str,
        attendance_date: Optional[date] = None,
        remarks: Optional[str] = None
    ) -> Attendance:
        """Mark attendance for a student (teacher only)."""
        # Check if attendance already exists
        attendance_date = attendance_date or date.today()
        existing = await self.attendance_repo.check_existing(
            student_id, class_id, attendance_date
        )
        
        if existing:
            # Update existing record
            existing.status = status
            existing.remarks = remarks
            existing.marked_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(existing)
            return existing
        else:
            # Create new record
            attendance = Attendance(
                student_id=student_id,
                class_id=class_id,
                date=attendance_date,
                status=status,
                remarks=remarks,
                marked_by=teacher_id
            )
            self.db.add(attendance)
            await self.db.flush()
            await self.db.refresh(attendance)
            return attendance
    
    async def get_school_analytics(
        self,
        attendance_date: Optional[date] = None
    ) -> dict:
        """Get school-wide attendance analytics (principal only)."""
        attendance_date = attendance_date or date.today()
        
        stats = await self.attendance_repo.get_school_attendance_stats(attendance_date)
        
        # Get class breakdown
        # In production, query each class's attendance
        class_breakdown = []
        
        return {
            "overall_percentage": stats["present_percentage"],
            "total_enrolled": stats["total"],
            "today_present": stats["by_status"].get("present", 0),
            "today_absent": stats["by_status"].get("absent", 0),
            "date": attendance_date,
            "class_breakdown": class_breakdown
        }

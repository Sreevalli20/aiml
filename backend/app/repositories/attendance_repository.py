from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.models.attendance import Attendance, AttendanceStatus
from app.models.student import Student
from app.models.class_model import ClassModel
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: AsyncSession):
        super().__init__(Attendance, db)
    
    async def get_student_attendance(
        self,
        student_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Attendance]:
        """Get attendance records for a student within a date range."""
        query = select(Attendance).where(Attendance.student_id == student_id)
        
        if start_date:
            query = query.where(Attendance.date >= start_date)
        if end_date:
            query = query.where(Attendance.date <= end_date)
        
        result = await self.db.execute(query.order_by(Attendance.date.desc()))
        return result.scalars().all()
    
    async def get_class_attendance(
        self,
        class_id: str,
        attendance_date: date
    ) -> List[Attendance]:
        """Get attendance for a class on a specific date."""
        result = await self.db.execute(
            select(Attendance)
            .where(
                and_(
                    Attendance.class_id == class_id,
                    func.date(Attendance.date) == attendance_date
                )
            )
        )
        return result.scalars().all()
    
    async def get_attendance_stats(
        self,
        student_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> dict:
        """Calculate attendance statistics for a student."""
        query = select(Attendance).where(Attendance.student_id == student_id)
        
        if start_date:
            query = query.where(Attendance.date >= start_date)
        if end_date:
            query = query.where(Attendance.date <= end_date)
        
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        total = len(records)
        present = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
        absent = sum(1 for r in records if r.status == AttendanceStatus.ABSENT)
        late = sum(1 for r in records if r.status == AttendanceStatus.LATE)
        excused = sum(1 for r in records if r.status == AttendanceStatus.EXCUSED)
        
        percentage = (present / total * 100) if total > 0 else 0.0
        
        return {
            "total": total,
            "present": present,
            "absent": absent,
            "late": late,
            "excused": excused,
            "percentage": round(percentage, 1)
        }
    
    async def get_school_attendance_stats(
        self,
        attendance_date: date
    ) -> dict:
        """Get school-wide attendance statistics for a date."""
        result = await self.db.execute(
            select(
                Attendance.status,
                func.count(Attendance.id).label('count')
            )
            .where(func.date(Attendance.date) == attendance_date)
            .group_by(Attendance.status)
        )
        
        stats = {status.value: 0 for status in AttendanceStatus}
        total = 0
        
        for row in result:
            stats[row.status.value] = row.count
            total += row.count
        
        return {
            "date": attendance_date,
            "total": total,
            "by_status": stats,
            "present_percentage": (stats.get("present", 0) / total * 100) if total > 0 else 0
        }
    
    async def check_existing(
        self,
        student_id: str,
        class_id: str,
        attendance_date: date
    ) -> Optional[Attendance]:
        """Check if attendance already exists for a student on a date."""
        result = await self.db.execute(
            select(Attendance)
            .where(
                and_(
                    Attendance.student_id == student_id,
                    Attendance.class_id == class_id,
                    func.date(Attendance.date) == attendance_date
                )
            )
        )
        return result.scalar_one_or_none()

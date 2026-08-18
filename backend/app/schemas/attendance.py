from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from app.models.attendance import AttendanceStatus


class AttendanceSummary(BaseModel):
    student_id: str
    student_name: str
    attendance_percentage: float
    present_days: int
    absent_days: int
    working_days: int
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    recent_absences: Optional[List[str]] = None


class AttendanceHistory(BaseModel):
    month: str
    present: int
    working: int
    percentage: float


class AttendanceResponse(BaseModel):
    student_id: str
    student_name: str
    attendance_percentage: float
    present_days: int
    absent_days: int
    working_days: int
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    history: Optional[List[AttendanceHistory]] = None
    recent_absences: Optional[List[str]] = None


class MarkAttendanceRequest(BaseModel):
    student_id: str
    status: AttendanceStatus
    date: Optional[date] = None
    remarks: Optional[str] = None


class MarkAttendanceResponse(BaseModel):
    success: bool
    message: str
    transaction_id: str
    updated_percentage: Optional[float] = None


class ClassAttendanceBreakdown(BaseModel):
    class_id: str
    class_name: str
    total_students: int
    present_count: int
    absent_count: int
    attendance_percentage: float


class AttendanceAnalytics(BaseModel):
    overall_percentage: float
    total_enrolled: int
    today_present: int
    today_absent: int
    date: date
    class_breakdown: List[ClassAttendanceBreakdown]

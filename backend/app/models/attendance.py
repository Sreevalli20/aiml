from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base
import enum


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)
    remarks = Column(Text)
    marked_by = Column(String, ForeignKey("teachers.id"))
    marked_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")

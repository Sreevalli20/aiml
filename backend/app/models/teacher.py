from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    qualification = Column(String)
    designation = Column(String)
    department = Column(String)
    joining_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="teacher")
    class_assignments = relationship("TeacherClassAssignment", back_populates="teacher")

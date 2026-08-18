from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Student(Base):
    __tablename__ = "students"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    admission_number = Column(String, unique=True, nullable=False)
    date_of_birth = Column(DateTime)
    blood_group = Column(String)
    address = Column(String)
    emergency_contact = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="student")
    class_relationships = relationship("StudentClassRelationship", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")
    parent_relationships = relationship("StudentParentRelationship", back_populates="student")

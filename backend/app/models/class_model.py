from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class ClassModel(Base):
    __tablename__ = "classes"
    
    id = Column(String, primary_key=True, index=True)
    school_id = Column(String, ForeignKey("schools.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "10-A", "9-B"
    grade = Column(String, nullable=False)  # e.g., "10", "9"
    section = Column(String, nullable=False)  # e.g., "A", "B"
    room_number = Column(String)
    academic_year = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    school = relationship("School", back_populates="classes")
    student_relationships = relationship("StudentClassRelationship", back_populates="class_model")
    teacher_assignments = relationship("TeacherClassAssignment", back_populates="class_model")
    subject_assignments = relationship("ClassSubjectAssignment", back_populates="class_model")

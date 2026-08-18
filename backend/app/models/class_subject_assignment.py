from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class ClassSubjectAssignment(Base):
    __tablename__ = "class_subject_assignments"
    
    id = Column(String, primary_key=True, index=True)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("teachers.id"))
    academic_year = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    class_model = relationship("ClassModel", back_populates="subject_assignments")
    subject = relationship("Subject", back_populates="class_assignments")

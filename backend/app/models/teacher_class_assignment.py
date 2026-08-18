from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class TeacherClassAssignment(Base):
    __tablename__ = "teacher_class_assignments"
    
    id = Column(String, primary_key=True, index=True)
    teacher_id = Column(String, ForeignKey("teachers.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    role = Column(String, nullable=False)  # e.g., "class_teacher", "subject_teacher"
    academic_year = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    teacher = relationship("Teacher", back_populates="class_assignments")
    class_model = relationship("ClassModel", back_populates="teacher_assignments")

from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class StudentClassRelationship(Base):
    __tablename__ = "student_class_relationships"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    academic_year = Column(String, nullable=False)
    roll_number_in_class = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="class_relationships")
    class_model = relationship("ClassModel", back_populates="student_relationships")

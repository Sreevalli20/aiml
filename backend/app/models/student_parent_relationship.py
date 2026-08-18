from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class StudentParentRelationship(Base):
    __tablename__ = "student_parent_relationships"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    parent_id = Column(String, ForeignKey("parents.id"), nullable=False)
    relationship_type = Column(String, nullable=False)  # e.g., "father", "mother", "guardian"
    is_primary_contact = Column(String, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("Student", back_populates="parent_relationships")
    parent = relationship("Parent", back_populates="child_relationships")

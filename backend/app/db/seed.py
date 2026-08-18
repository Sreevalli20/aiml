import asyncio
import uuid
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import AsyncSessionLocal, Base, engine
from app.models import (
    User, UserRole, Student, Parent, Teacher, School, ClassModel,
    Subject, StudentParentRelationship, StudentClassRelationship,
    TeacherClassAssignment, Attendance, AttendanceStatus
)
from app.security.password import get_password_hash


async def seed_database():
    """Seed the database with sample data for development."""
    async with AsyncSessionLocal() as db:
        # Force delete and recreate demo user to ensure correct password
        from sqlalchemy import select, delete
        print("=== FORCE RECREATING DEMO USER ===")
        
        try:
            # Delete existing demo user if exists
            await db.execute(delete(User).where(User.email == "rahul.sharma@greenwood.edu"))
            await db.commit()
            print("✓ Deleted existing demo user")
        except Exception as e:
            print(f"✗ Delete failed (may not exist): {e}")
            await db.rollback()
        
        try:
            # Create fresh demo user
            new_user = User(
                id=str(uuid.uuid4()),
                email="rahul.sharma@greenwood.edu",
                username="rahul.sharma",
                hashed_password=get_password_hash("student123"),
                full_name="Rahul Sharma",
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(new_user)
            await db.commit()
            print(f"✓ Created demo user: rahul.sharma@greenwood.edu")
            print(f"✓ Password hash: {new_user.hashed_password[:50]}...")
        except Exception as e:
            print(f"✗ Create failed: {e}")
            await db.rollback()
            raise
        
        print("=== DEMO USER SETUP COMPLETE ===")
        
        # Check if school already exists (indicates seed already run)
        result = await db.execute(select(School).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping data creation...")
            return


if __name__ == "__main__":
    asyncio.run(seed_database())

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
        from sqlalchemy import select, delete, update
        print("=== ENSURING DEMO USER PASSWORD ===")
        
        # Check if demo user exists by email
        result = await db.execute(select(User).where(User.email == "rahul.sharma@greenwood.edu"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            # Update existing user's password with correct bcrypt hash
            new_hash = get_password_hash("student123")
            await db.execute(
                update(User)
                .where(User.email == "rahul.sharma@greenwood.edu")
                .values(hashed_password=new_hash)
            )
            await db.commit()
            print(f"✓ Updated password for existing user: rahul.sharma@greenwood.edu")
        else:
            # Create new demo user with bcrypt hash
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
        
        # Also check by username to ensure no conflicts
        result = await db.execute(select(User).where(User.username == "rahul.sharma"))
        username_user = result.scalar_one_or_none()
        if username_user and username_user.email != "rahul.sharma@greenwood.edu":
            print(f"⚠ Found conflicting username user: {username_user.email}")
            await db.execute(delete(User).where(User.id == username_user.id))
            await db.commit()
            print(f"✓ Deleted conflicting username user")
        
        # Check if school already exists (indicates seed already run)
        result = await db.execute(select(School).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping data creation...")
            return


if __name__ == "__main__":
    asyncio.run(seed_database())

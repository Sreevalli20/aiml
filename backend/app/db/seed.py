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
        # Simple approach: Update existing user passwords or create new users
        from sqlalchemy import select
        print("=== CHECKING AND UPDATING USERS ===")
        
        users_to_ensure = [
            ("principal@greenwood.edu", "principal", "admin123", "Dr. Ramesh Mehta", UserRole.PRINCIPAL),
            ("anjali.rao@greenwood.edu", "anjali.rao", "teacher123", "Mrs. Anjali Rao", UserRole.TEACHER),
            ("rahul.sharma@greenwood.edu", "rahul.sharma", "student123", "Rahul Sharma", UserRole.STUDENT),
            ("sneha.patel@greenwood.edu", "sneha.patel", "student123", "Sneha Patel", UserRole.STUDENT),
            ("alok.sharma@gmail.com", "alok.sharma", "parent123", "Mr. Alok Sharma", UserRole.PARENT),
        ]
        
        for email, username, password, full_name, role in users_to_ensure:
            try:
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
                
                if user:
                    # Update existing user
                    user.hashed_password = get_password_hash(password)
                    user.is_active = True
                    print(f"✓ Updated password for {email}")
                else:
                    # Create new user
                    new_user = User(
                        id=str(uuid.uuid4()),
                        email=email,
                        username=username,
                        hashed_password=get_password_hash(password),
                        full_name=full_name,
                        role=role,
                        is_active=True
                    )
                    db.add(new_user)
                    print(f"✓ Created new user {email}")
            except Exception as e:
                print(f"✗ Error processing {email}: {e}")
        
        try:
            await db.commit()
            print("=== USER PASSWORD UPDATE COMPLETE ===")
        except Exception as e:
            print(f"✗ Commit failed: {e}")
            await db.rollback()
            raise
        
        # Check if school already exists (indicates seed already run)
        result = await db.execute(select(School).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping data creation...")
            return


if __name__ == "__main__":
    asyncio.run(seed_database())

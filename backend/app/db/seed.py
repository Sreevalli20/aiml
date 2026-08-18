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
        from sqlalchemy import delete
        print("=== ENSURING DEMO USERS EXIST ===")
        
        # Demo users configuration
        demo_users = [
            {
                "email": "demo.student@greenwood.edu",
                "username": "demo.student",
                "password": "demo123",
                "full_name": "Demo Student",
                "role": UserRole.STUDENT
            },
            {
                "email": "demo.parent@greenwood.edu",
                "username": "demo.parent",
                "password": "demo123",
                "full_name": "Demo Parent",
                "role": UserRole.PARENT
            },
            {
                "email": "demo.teacher@greenwood.edu",
                "username": "demo.teacher",
                "password": "demo123",
                "full_name": "Demo Teacher",
                "role": UserRole.TEACHER
            },
            {
                "email": "demo.principal@greenwood.edu",
                "username": "demo.principal",
                "password": "demo123",
                "full_name": "Demo Principal",
                "role": UserRole.PRINCIPAL
            },
        ]
        
        # Delete and recreate all demo users
        for demo_user in demo_users:
            await db.execute(delete(User).where(User.email == demo_user["email"]))
            await db.commit()
            
            new_user = User(
                id=str(uuid.uuid4()),
                email=demo_user["email"],
                username=demo_user["username"],
                hashed_password=get_password_hash(demo_user["password"]),
                full_name=demo_user["full_name"],
                role=demo_user["role"],
                is_active=True
            )
            db.add(new_user)
            await db.commit()
            print(f"✓ Demo user created: {demo_user['email']} ({demo_user['role']})")
        
        print("=== DEMO USERS SETUP COMPLETE ===")
        
        # Check if school already exists (indicates seed already run)
        result = await db.execute(select(School).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping data creation...")
            return


if __name__ == "__main__":
    asyncio.run(seed_database())

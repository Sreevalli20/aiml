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
        # Check if school already exists (indicates seed already run)
        from sqlalchemy import select
        result = await db.execute(select(School).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping...")
            return
        # Create school
        school = School(
            id=str(uuid.uuid4()),
            name="Greenwood International Academy",
            code="GIA",
            address="123 Education Lane, Academic City",
            phone="+91 1234567890",
            email="contact@greenwood.edu",
            academic_year="2026-2027"
        )
        db.add(school)
        await db.flush()
        
        # Create users and profiles
        # Principal
        principal_user = User(
            id=str(uuid.uuid4()),
            email="principal@greenwood.edu",
            username="principal",
            hashed_password=get_password_hash("admin123"),
            full_name="Dr. Ramesh Mehta",
            role=UserRole.PRINCIPAL,
            is_active=True
        )
        db.add(principal_user)
        await db.flush()
        school.principal_id = principal_user.id
        
        # Teacher
        teacher_user = User(
            id=str(uuid.uuid4()),
            email="anjali.rao@greenwood.edu",
            username="anjali.rao",
            hashed_password=get_password_hash("teacher123"),
            full_name="Mrs. Anjali Rao",
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(teacher_user)
        await db.flush()
        
        teacher = Teacher(
            id=str(uuid.uuid4()),
            user_id=teacher_user.id,
            employee_id="TCH8801",
            phone="+91 98111 22334",
            qualification="M.Sc Mathematics",
            designation="Senior Teacher",
            department="Science & Math",
            joining_date=date(2020, 6, 1)
        )
        db.add(teacher)
        await db.flush()
        
        # Student 1
        student1_user = User(
            id=str(uuid.uuid4()),
            email="rahul.sharma@greenwood.edu",
            username="rahul.sharma",
            hashed_password=get_password_hash("student123"),
            full_name="Rahul Sharma",
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(student1_user)
        await db.flush()
        
        student1 = Student(
            id=str(uuid.uuid4()),
            user_id=student1_user.id,
            roll_number="24",
            admission_number="ADM2026001",
            date_of_birth=date(2010, 5, 15),
            blood_group="O+",
            address="45 Student Street, City"
        )
        db.add(student1)
        await db.flush()
        
        # Student 2
        student2_user = User(
            id=str(uuid.uuid4()),
            email="sneha.patel@greenwood.edu",
            username="sneha.patel",
            hashed_password=get_password_hash("student123"),
            full_name="Sneha Patel",
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(student2_user)
        await db.flush()
        
        student2 = Student(
            id=str(uuid.uuid4()),
            user_id=student2_user.id,
            roll_number="25",
            admission_number="ADM2026002",
            date_of_birth=date(2010, 8, 20),
            blood_group="A+",
            address="56 Student Avenue, City"
        )
        db.add(student2)
        await db.flush()
        
        # Parent
        parent_user = User(
            id=str(uuid.uuid4()),
            email="alok.sharma@gmail.com",
            username="alok.sharma",
            hashed_password=get_password_hash("parent123"),
            full_name="Mr. Alok Sharma",
            role=UserRole.PARENT,
            is_active=True
        )
        db.add(parent_user)
        await db.flush()
        
        parent = Parent(
            id=str(uuid.uuid4()),
            user_id=parent_user.id,
            phone="+91 98765 43210",
            occupation="Business",
        )
        db.add(parent)
        await db.flush()
        
        # Create parent-child relationship
        parent_child = StudentParentRelationship(
            id=str(uuid.uuid4()),
            student_id=student1.id,
            parent_id=parent.id,
            relationship_type="father",
            is_primary_contact=True
        )
        db.add(parent_child)
        
        # Create class
        class_10a = ClassModel(
            id=str(uuid.uuid4()),
            school_id=school.id,
            name="10-A",
            grade="10",
            section="A",
            room_number="101",
            academic_year="2026-2027"
        )
        db.add(class_10a)
        await db.flush()
        
        # Create subject
        math_subject = Subject(
            id=str(uuid.uuid4()),
            name="Mathematics",
            code="MATH101",
            description="Mathematics for Grade 10"
        )
        db.add(math_subject)
        
        # Assign students to class
        student1_class = StudentClassRelationship(
            id=str(uuid.uuid4()),
            student_id=student1.id,
            class_id=class_10a.id,
            academic_year="2026-2027",
            roll_number_in_class="24"
        )
        db.add(student1_class)
        
        student2_class = StudentClassRelationship(
            id=str(uuid.uuid4()),
            student_id=student2.id,
            class_id=class_10a.id,
            academic_year="2026-2027",
            roll_number_in_class="25"
        )
        db.add(student2_class)
        
        # Assign teacher to class
        teacher_class = TeacherClassAssignment(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            class_id=class_10a.id,
            role="class_teacher",
            academic_year="2026-2027"
        )
        db.add(teacher_class)
        
        # Create attendance records for student 1
        # Generate attendance for the last 3 months
        today = date.today()
        for day_offset in range(90, 0, -1):
            attendance_date = today - timedelta(days=day_offset)
            
            # Skip weekends
            if attendance_date.weekday() >= 5:
                continue
            
            # Random attendance status (mostly present)
            import random
            rand = random.random()
            if rand < 0.85:
                status = AttendanceStatus.PRESENT
            elif rand < 0.92:
                status = AttendanceStatus.ABSENT
            elif rand < 0.96:
                status = AttendanceStatus.LATE
            else:
                status = AttendanceStatus.EXCUSED
            
            attendance = Attendance(
                id=str(uuid.uuid4()),
                student_id=student1.id,
                class_id=class_10a.id,
                date=attendance_date,
                status=status,
                marked_by=teacher.id,
                remarks="Daily attendance"
            )
            db.add(attendance)
        
        # Create attendance records for student 2
        for day_offset in range(90, 0, -1):
            attendance_date = today - timedelta(days=day_offset)
            
            if attendance_date.weekday() >= 5:
                continue
            
            import random
            rand = random.random()
            if rand < 0.92:
                status = AttendanceStatus.PRESENT
            elif rand < 0.97:
                status = AttendanceStatus.ABSENT
            else:
                status = AttendanceStatus.LATE
            
            attendance = Attendance(
                id=str(uuid.uuid4()),
                student_id=student2.id,
                class_id=class_10a.id,
                date=attendance_date,
                status=status,
                marked_by=teacher.id,
                remarks="Daily attendance"
            )
            db.add(attendance)
        
        await db.commit()
        
        print("Database seeded successfully!")
        print("\nDemo Credentials:")
        print("=================")
        print("Principal:")
        print("  Email: principal@greenwood.edu")
        print("  Password: admin123")
        print("\nTeacher:")
        print("  Email: anjali.rao@greenwood.edu")
        print("  Password: teacher123")
        print("\nStudent:")
        print("  Email: rahul.sharma@greenwood.edu")
        print("  Password: student123")
        print("\nParent:")
        print("  Email: alok.sharma@gmail.com")
        print("  Password: parent123")


if __name__ == "__main__":
    asyncio.run(seed_database())

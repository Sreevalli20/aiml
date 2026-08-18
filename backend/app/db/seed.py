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
        # Delete ALL existing data and recreate from scratch
        from sqlalchemy import select, delete
        print("=== DELETING ALL EXISTING DATA ===")
        await db.execute(delete(Attendance))
        await db.execute(delete(StudentClassRelationship))
        await db.execute(delete(TeacherClassAssignment))
        await db.execute(delete(StudentParentRelationship))
        await db.execute(delete(Subject))
        await db.execute(delete(ClassModel))
        await db.execute(delete(Student))
        await db.execute(delete(Parent))
        await db.execute(delete(Teacher))
        await db.execute(delete(School))
        await db.execute(delete(User))
        await db.commit()
        print("=== ALL DATA DELETED ===")
        
        # Recreate all data from scratch
        print("=== CREATING FRESH DATA ===")
        
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
        print(f"✓ Created principal with password admin123")
        
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
        print(f"✓ Created teacher with password teacher123")
        
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
        print(f"✓ Created student rahul.sharma@greenwood.edu with password student123")
        
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
        print(f"✓ Created student sneha.patel@greenwood.edu with password student123")
        
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
        print(f"✓ Created parent with password parent123")
        
        await db.commit()
        print("=== USER CREATION COMPLETE ===")
        
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
        school.principal_id = principal_user.id
        print("✓ Created school")
        
        # Teacher profile
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
        print("✓ Created teacher profile")
        
        # Student 1 profile
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
        print("✓ Created student 1 profile")
        
        # Student 2 profile
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
        print("✓ Created student 2 profile")
        
        # Parent profile
        parent = Parent(
            id=str(uuid.uuid4()),
            user_id=parent_user.id,
            phone="+91 98765 43210",
            occupation="Business",
        )
        db.add(parent)
        await db.flush()
        print("✓ Created parent profile")
        
        # Parent-child relationship
        parent_child = StudentParentRelationship(
            id=str(uuid.uuid4()),
            student_id=student1.id,
            parent_id=parent.id,
            relationship_type="father",
            is_primary_contact=True
        )
        db.add(parent_child)
        print("✓ Created parent-child relationship")
        
        # Class
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
        print("✓ Created class")
        
        # Subject
        math_subject = Subject(
            id=str(uuid.uuid4()),
            name="Mathematics",
            code="MATH101",
            description="Mathematics for Grade 10"
        )
        db.add(math_subject)
        print("✓ Created subject")
        
        # Student-class relationships
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
        print("✓ Created student-class relationships")
        
        # Teacher-class assignment
        teacher_class = TeacherClassAssignment(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            class_id=class_10a.id,
            role="class_teacher",
            academic_year="2026-2027"
        )
        db.add(teacher_class)
        print("✓ Created teacher-class assignment")
        
        # Attendance records
        today = date.today()
        for day_offset in range(90, 0, -1):
            attendance_date = today - timedelta(days=day_offset)
            if attendance_date.weekday() >= 5:
                continue
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
        print("✓ Created attendance records")
        
        await db.commit()
        print("=== DATABASE SEEDED SUCCESSFULLY ===")
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

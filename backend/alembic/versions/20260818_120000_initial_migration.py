"""initial migration

Revision ID: 001
Revises: 
Create Date: 2026-08-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create user_role enum
    user_role_enum = postgresql.ENUM('student', 'parent', 'teacher', 'principal', name='userrole')
    user_role_enum.create(op.get_bind())
    
    # Create attendance_status enum
    attendance_status_enum = postgresql.ENUM('present', 'absent', 'late', 'excused', name='attendancestatus')
    attendance_status_enum.create(op.get_bind())
    
    # Create escalation_type enum
    escalation_type_enum = postgresql.ENUM('teacher', 'management', name='escalationtype')
    escalation_type_enum.create(op.get_bind())
    
    # Create escalation_status enum
    escalation_status_enum = postgresql.ENUM('pending', 'submitted', 'accepted', 'completed', 'cancelled', 'failed', name='escalationstatus')
    escalation_status_enum.create(op.get_bind())
    
    # Create audit_action enum
    audit_action_enum = postgresql.ENUM('login', 'logout', 'attendance_view', 'attendance_mark', 'attendance_update', 'analytics_view', 'escalation_created', 'authorization_denied', 'security_event', 'conversation_created', 'conversation_message', name='auditaction')
    audit_action_enum.create(op.get_bind())
    
    # Create schools table
    op.create_table(
        'schools',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('principal_id', sa.String(), nullable=True),
        sa.Column('academic_year', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_schools_id'), 'schools', ['id'], unique=False)
    op.create_index(op.f('ix_schools_code'), 'schools', ['code'], unique=True)
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    
    # Create subjects table
    op.create_table(
        'subjects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subjects_code'), 'subjects', ['code'], unique=True)
    op.create_index(op.f('ix_subjects_id'), 'subjects', ['id'], unique=False)
    
    # Create students table
    op.create_table(
        'students',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('roll_number', sa.String(), nullable=False),
        sa.Column('admission_number', sa.String(), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(), nullable=True),
        sa.Column('blood_group', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('emergency_contact', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_students_admission_number'), 'students', ['admission_number'], unique=True)
    op.create_index(op.f('ix_students_id'), 'students', ['id'], unique=False)
    op.create_index(op.f('ix_students_roll_number'), 'students', ['roll_number'], unique=True)
    
    # Create parents table
    op.create_table(
        'parents',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('occupation', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_parents_id'), 'parents', ['id'], unique=False)
    
    # Create teachers table
    op.create_table(
        'teachers',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('employee_id', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('qualification', sa.String(), nullable=True),
        sa.Column('designation', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('joining_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teachers_employee_id'), 'teachers', ['employee_id'], unique=True)
    op.create_index(op.f('ix_teachers_id'), 'teachers', ['id'], unique=False)
    
    # Create classes table
    op.create_table(
        'classes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('school_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('grade', sa.String(), nullable=False),
        sa.Column('section', sa.String(), nullable=False),
        sa.Column('room_number', sa.String(), nullable=True),
        sa.Column('academic_year', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['school_id'], ['schools.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_classes_id'), 'classes', ['id'], unique=False)
    
    # Create student_parent_relationships table
    op.create_table(
        'student_parent_relationships',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('student_id', sa.String(), nullable=False),
        sa.Column('parent_id', sa.String(), nullable=False),
        sa.Column('relationship_type', sa.String(), nullable=False),
        sa.Column('is_primary_contact', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['parents.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_parent_relationships_id'), 'student_parent_relationships', ['id'], unique=False)
    
    # Create student_class_relationships table
    op.create_table(
        'student_class_relationships',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('student_id', sa.String(), nullable=False),
        sa.Column('class_id', sa.String(), nullable=False),
        sa.Column('academic_year', sa.String(), nullable=False),
        sa.Column('roll_number_in_class', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_student_class_relationships_id'), 'student_class_relationships', ['id'], unique=False)
    
    # Create teacher_class_assignments table
    op.create_table(
        'teacher_class_assignments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('teacher_id', sa.String(), nullable=False),
        sa.Column('class_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('academic_year', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['teacher_id'], ['teachers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teacher_class_assignments_id'), 'teacher_class_assignments', ['id'], unique=False)
    
    # Create class_subject_assignments table
    op.create_table(
        'class_subject_assignments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('class_id', sa.String(), nullable=False),
        sa.Column('subject_id', sa.String(), nullable=False),
        sa.Column('teacher_id', sa.String(), nullable=True),
        sa.Column('academic_year', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ),
        sa.ForeignKeyConstraint(['teacher_id'], ['teachers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_class_subject_assignments_id'), 'class_subject_assignments', ['id'], unique=False)
    
    # Create attendance table
    op.create_table(
        'attendance',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('student_id', sa.String(), nullable=False),
        sa.Column('class_id', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', attendance_status_enum, nullable=False),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('marked_by', sa.String(), nullable=True),
        sa.Column('marked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['marked_by'], ['teachers.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attendance_class_id'), 'attendance', ['class_id'], unique=False)
    op.create_index(op.f('ix_attendance_date'), 'attendance', ['date'], unique=False)
    op.create_index(op.f('ix_attendance_id'), 'attendance', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_student_id'), 'attendance', ['student_id'], unique=False)
    
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('context', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)
    
    # Create conversation_messages table
    op.create_table(
        'conversation_messages',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('conversation_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('intent', sa.String(), nullable=True),
        sa.Column('entities', postgresql.JSON(), nullable=True),
        sa.Column('tool_calls', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversation_messages_conversation_id'), 'conversation_messages', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_conversation_messages_id'), 'conversation_messages', ['id'], unique=False)
    
    # Create escalation_requests table
    op.create_table(
        'escalation_requests',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('requested_by', sa.String(), nullable=False),
        sa.Column('escalation_type', escalation_type_enum, nullable=False),
        sa.Column('target_user_id', sa.String(), nullable=True),
        sa.Column('student_id', sa.String(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('contact_number', sa.String(), nullable=True),
        sa.Column('status', escalation_status_enum, nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['requested_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['target_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_escalation_requests_id'), 'escalation_requests', ['id'], unique=False)
    op.create_index(op.f('ix_escalation_requests_requested_by'), 'escalation_requests', ['requested_by'], unique=False)
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('user_role', sa.String(), nullable=False),
        sa.Column('action', audit_action_enum, nullable=False),
        sa.Column('resource_type', sa.String(), nullable=True),
        sa.Column('resource_id', sa.String(), nullable=True),
        sa.Column('details', postgresql.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('success', sa.String(), nullable=False),
        sa.Column('correlation_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_correlation_id'), 'audit_logs', ['correlation_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_user_role'), 'audit_logs', ['user_role'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_audit_logs_user_role'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_user_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_created_at'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_correlation_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_action'), table_name='audit_logs')
    op.drop_table('audit_logs')
    
    op.drop_index(op.f('ix_escalation_requests_requested_by'), table_name='escalation_requests')
    op.drop_index(op.f('ix_escalation_requests_id'), table_name='escalation_requests')
    op.drop_table('escalation_requests')
    
    op.drop_index(op.f('ix_conversation_messages_id'), table_name='conversation_messages')
    op.drop_index(op.f('ix_conversation_messages_conversation_id'), table_name='conversation_messages')
    op.drop_table('conversation_messages')
    
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
    
    op.drop_index(op.f('ix_attendance_student_id'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_id'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_date'), table_name='attendance')
    op.drop_index(op.f('ix_attendance_class_id'), table_name='attendance')
    op.drop_table('attendance')
    
    op.drop_index(op.f('ix_class_subject_assignments_id'), table_name='class_subject_assignments')
    op.drop_table('class_subject_assignments')
    
    op.drop_index(op.f('ix_teacher_class_assignments_id'), table_name='teacher_class_assignments')
    op.drop_table('teacher_class_assignments')
    
    op.drop_index(op.f('ix_student_class_relationships_id'), table_name='student_class_relationships')
    op.drop_table('student_class_relationships')
    
    op.drop_index(op.f('ix_student_parent_relationships_id'), table_name='student_parent_relationships')
    op.drop_table('student_parent_relationships')
    
    op.drop_index(op.f('ix_classes_id'), table_name='classes')
    op.drop_table('classes')
    
    op.drop_index(op.f('ix_teachers_id'), table_name='teachers')
    op.drop_index(op.f('ix_teachers_employee_id'), table_name='teachers')
    op.drop_table('teachers')
    
    op.drop_index(op.f('ix_parents_id'), table_name='parents')
    op.drop_table('parents')
    
    op.drop_index(op.f('ix_students_roll_number'), table_name='students')
    op.drop_index(op.f('ix_students_id'), table_name='students')
    op.drop_index(op.f('ix_students_admission_number'), table_name='students')
    op.drop_table('students')
    
    op.drop_index(op.f('ix_subjects_id'), table_name='subjects')
    op.drop_index(op.f('ix_subjects_code'), table_name='subjects')
    op.drop_table('subjects')
    
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    op.drop_index(op.f('ix_schools_code'), table_name='schools')
    op.drop_index(op.f('ix_schools_id'), table_name='schools')
    op.drop_table('schools')
    
    # Drop enums
    postgresql.ENUM(name='auditaction').drop(op.get_bind())
    postgresql.ENUM(name='escalationstatus').drop(op.get_bind())
    postgresql.ENUM(name='escalationtype').drop(op.get_bind())
    postgresql.ENUM(name='attendancestatus').drop(op.get_bind())
    postgresql.ENUM(name='userrole').drop(op.get_bind())

"""fix audit_log success column type

Revision ID: 002
Revises: 001
Create Date: 2026-08-18 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Change success column from String to Boolean
    op.alter_column('audit_logs', 'success',
                    existing_type=sa.String(),
                    type_=sa.Boolean(),
                    existing_nullable=False,
                    existing_default=True)


def downgrade():
    # Revert back to String
    op.alter_column('audit_logs', 'success',
                    existing_type=sa.Boolean(),
                    type_=sa.String(),
                    existing_nullable=False,
                    existing_default=True)

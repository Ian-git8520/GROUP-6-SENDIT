"""add_user_id_to_riders

Revision ID: add_user_id_to_riders
Revises: 3c2a70078f28
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_id_to_riders'
down_revision = '3c2a70078f28'
branch_labels = None
depends_on = None


def upgrade():
    # Add user_id column to riders table
    op.add_column('riders', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_riders_user_id', 'riders', 'users', ['user_id'], ['id'])


def downgrade():
    # Remove foreign key and column
    op.drop_constraint('fk_riders_user_id', 'riders', type_='foreignkey')
    op.drop_column('riders', 'user_id')

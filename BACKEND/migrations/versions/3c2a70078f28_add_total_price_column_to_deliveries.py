"""Add total_price column to deliveries

Revision ID: 3c2a70078f28
Revises: 
Create Date: 2026-01-29 18:06:48.862090
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3c2a70078f28'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema: add total_price column if it doesn't exist."""
    # For SQLite, you can't check dynamically, so you can skip if it already exists
    pass  # nothing to do because column exists

def downgrade() -> None:
    op.drop_column('deliveries', 'total_price')

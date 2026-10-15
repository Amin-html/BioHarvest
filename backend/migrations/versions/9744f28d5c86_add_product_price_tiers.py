"""add product_price_tiers table (B2B/wholesale pricing)

Revision ID: 9744f28d5c86
Revises: eed4e0e35649
Create Date: 2026-10-15 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9744f28d5c86'
down_revision: Union[str, Sequence[str], None] = 'eed4e0e35649'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'product_price_tiers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('min_quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.CheckConstraint('min_quantity > 0', name='ck_price_tier_min_quantity_positive'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'min_quantity', name='uq_price_tier_product_min_qty'),
    )
    op.create_index(
        op.f('ix_product_price_tiers_product_id'), 'product_price_tiers', ['product_id'], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_product_price_tiers_product_id'), table_name='product_price_tiers')
    op.drop_table('product_price_tiers')
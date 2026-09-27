"""add product description and product_images table

Revision ID: 037a3252f84f
Revises: d7667e575ee4
Create Date: 2026-09-26 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '037a3252f84f'
down_revision: Union[str, Sequence[str], None] = 'd7667e575ee4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('products', sa.Column('description', sa.String(), nullable=True))

    op.create_table('product_images',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('url', sa.String(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('is_primary', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_images_product_id'), 'product_images', ['product_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_product_images_product_id'), table_name='product_images')
    op.drop_table('product_images')
    op.drop_column('products', 'description')

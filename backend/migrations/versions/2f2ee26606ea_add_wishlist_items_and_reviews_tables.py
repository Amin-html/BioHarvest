"""add wishlist_items and reviews tables

Revision ID: 2f2ee26606ea
Revises: 037a3252f84f
Create Date: 2026-09-29 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f2ee26606ea'
down_revision: Union[str, Sequence[str], None] = '037a3252f84f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('wishlist_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['product_id'], ['products.id']),
    sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'product_id', name='uq_wishlist_user_product'),
    )

    review_status = sa.Enum('PENDING', 'APPROVED', 'REJECTED', name='reviewstatus')
    review_status.create(op.get_bind(), checkfirst=True)

    op.create_table('reviews',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('comment', sa.String(), nullable=True),
    sa.Column('is_verified_purchase', sa.Boolean(), nullable=False),
    sa.Column('status', review_status, nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint('rating >= 1 AND rating <= 5', name='ck_review_rating_range'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id']),
    sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'product_id', name='uq_review_user_product'),
    )
    op.create_index(op.f('ix_reviews_product_id'), 'reviews', ['product_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_reviews_product_id'), table_name='reviews')
    op.drop_table('reviews')
    sa.Enum(name='reviewstatus').drop(op.get_bind(), checkfirst=True)
    op.drop_table('wishlist_items')

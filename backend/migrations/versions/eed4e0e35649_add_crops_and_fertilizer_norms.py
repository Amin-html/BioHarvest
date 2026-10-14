"""add crops and fertilizer_norms tables, seed reference data

Revision ID: eed4e0e35649
Revises: c89c800dbdbf
Create Date: 2026-10-14 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eed4e0e35649'
down_revision: Union[str, Sequence[str], None] = 'c89c800dbdbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'crops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    op.create_table(
        'fertilizer_norms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('fertilizer_name', sa.String(), nullable=False),
        sa.Column('stage', sa.String(), nullable=False),
        sa.Column('dosage_per_sotka_kg', sa.Numeric(10, 3), nullable=False),
        sa.Column('note', sa.String(), nullable=True),
        sa.Column('recommended_product_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recommended_product_id'], ['products.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_fertilizer_norms_crop_id'), 'fertilizer_norms', ['crop_id'], unique=False)

    # --- Справочные данные (сеются сразу, чтобы калькулятор заработал без ручных правок в БД) ---
    crops_table = sa.table(
        'crops',
        sa.column('id', sa.Integer),
        sa.column('name', sa.String),
        sa.column('slug', sa.String),
    )
    norms_table = sa.table(
        'fertilizer_norms',
        sa.column('id', sa.Integer),
        sa.column('crop_id', sa.Integer),
        sa.column('fertilizer_name', sa.String),
        sa.column('stage', sa.String),
        sa.column('dosage_per_sotka_kg', sa.Numeric),
        sa.column('note', sa.String),
    )

    op.bulk_insert(crops_table, [
        {'id': 1, 'name': 'Томаты', 'slug': 'tomaty'},
        {'id': 2, 'name': 'Огурцы', 'slug': 'ogurtsy'},
        {'id': 3, 'name': 'Картофель', 'slug': 'kartofel'},
        {'id': 4, 'name': 'Яблоня', 'slug': 'yablonya'},
        {'id': 5, 'name': 'Виноград', 'slug': 'vinograd'},
        {'id': 6, 'name': 'Пшеница', 'slug': 'pshenitsa'},
    ])

    op.bulk_insert(norms_table, [
        # Томаты
        {'id': 1, 'crop_id': 1, 'fertilizer_name': 'Аммиачная селитра', 'stage': 'До посадки',
         'dosage_per_sotka_kg': 1.5, 'note': 'Вносится при перекопке почвы'},
        {'id': 2, 'crop_id': 1, 'fertilizer_name': 'Суперфосфат', 'stage': 'Период цветения',
         'dosage_per_sotka_kg': 2.0, 'note': 'Способствует формированию завязей'},
        {'id': 3, 'crop_id': 1, 'fertilizer_name': 'Калийная соль', 'stage': 'Период плодоношения',
         'dosage_per_sotka_kg': 1.2, 'note': None},
        # Огурцы
        {'id': 4, 'crop_id': 2, 'fertilizer_name': 'Перегной / компост', 'stage': 'До посадки (осень)',
         'dosage_per_sotka_kg': 40.0, 'note': 'Органическое удобрение'},
        {'id': 5, 'crop_id': 2, 'fertilizer_name': 'Аммиачная селитра', 'stage': 'Период роста',
         'dosage_per_sotka_kg': 1.0, 'note': None},
        {'id': 6, 'crop_id': 2, 'fertilizer_name': 'Калийная соль', 'stage': 'Период плодоношения',
         'dosage_per_sotka_kg': 1.0, 'note': None},
        # Картофель
        {'id': 7, 'crop_id': 3, 'fertilizer_name': 'Суперфосфат', 'stage': 'До посадки',
         'dosage_per_sotka_kg': 2.5, 'note': None},
        {'id': 8, 'crop_id': 3, 'fertilizer_name': 'Аммиачная селитра', 'stage': 'Всходы',
         'dosage_per_sotka_kg': 1.5, 'note': None},
        {'id': 9, 'crop_id': 3, 'fertilizer_name': 'Калийная соль', 'stage': 'Цветение',
         'dosage_per_sotka_kg': 1.8, 'note': None},
        # Яблоня
        {'id': 10, 'crop_id': 4, 'fertilizer_name': 'Перегной', 'stage': 'Осень',
         'dosage_per_sotka_kg': 50.0, 'note': 'Вносится в приствольный круг'},
        {'id': 11, 'crop_id': 4, 'fertilizer_name': 'Аммиачная селитра', 'stage': 'Весна',
         'dosage_per_sotka_kg': 2.0, 'note': None},
        {'id': 12, 'crop_id': 4, 'fertilizer_name': 'Суперфосфат', 'stage': 'Лето',
         'dosage_per_sotka_kg': 2.5, 'note': None},
        # Виноград
        {'id': 13, 'crop_id': 5, 'fertilizer_name': 'Суперфосфат', 'stage': 'Весна',
         'dosage_per_sotka_kg': 2.0, 'note': None},
        {'id': 14, 'crop_id': 5, 'fertilizer_name': 'Калийная соль', 'stage': 'Период созревания',
         'dosage_per_sotka_kg': 1.5, 'note': None},
        # Пшеница
        {'id': 15, 'crop_id': 6, 'fertilizer_name': 'Аммиачная селитра', 'stage': 'Кущение',
         'dosage_per_sotka_kg': 1.0, 'note': None},
        {'id': 16, 'crop_id': 6, 'fertilizer_name': 'Суперфосфат', 'stage': 'Посев',
         'dosage_per_sotka_kg': 1.5, 'note': None},
    ])


def downgrade() -> None:
    op.drop_index(op.f('ix_fertilizer_norms_crop_id'), table_name='fertilizer_norms')
    op.drop_table('fertilizer_norms')
    op.drop_table('crops')
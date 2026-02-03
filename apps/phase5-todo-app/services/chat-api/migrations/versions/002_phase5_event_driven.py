"""Phase V event-driven architecture - Add status, reminder_time, recurrence_rule_id to tasks,
create recurrence_rules and reminders tables.

Revision ID: 002_phase5_event_driven
Revises: 001_phase3_initial
Create Date: 2026-02-03

Per data-model.md entity definitions.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_phase5_event_driven'
down_revision: Union[str, None] = '001_phase3_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create recurrence_rules table (must exist before tasks FK)
    op.create_table(
        'recurrence_rules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('frequency', sa.String(), nullable=False),
        sa.Column('end_after_count', sa.Integer(), nullable=True),
        sa.Column('end_by_date', sa.DateTime(), nullable=True),
        sa.Column('occurrences_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recurrence_rules_task_id', 'recurrence_rules', ['task_id'])

    # Create reminders table
    op.create_table(
        'reminders',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('trigger_time', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('dapr_job_name', sa.String(), nullable=False, unique=True),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_reminders_task_id', 'reminders', ['task_id'])
    op.create_index('ix_reminders_user_id', 'reminders', ['user_id'])

    # Extend tasks table with Phase V fields
    op.add_column('tasks', sa.Column('status', sa.String(), nullable=True, server_default='pending'))
    op.add_column('tasks', sa.Column('reminder_time', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_rule_id', sa.Integer(),
                                     sa.ForeignKey('recurrence_rules.id', ondelete='SET NULL'),
                                     nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.Date(), nullable=True))
    op.add_column('tasks', sa.Column('due_time', sa.String(5), nullable=True))

    # Backfill status from completed boolean
    op.execute("UPDATE tasks SET status = CASE WHEN completed = true THEN 'completed' ELSE 'pending' END")

    # Make status NOT NULL after backfill
    op.alter_column('tasks', 'status', nullable=False)


def downgrade() -> None:
    op.drop_column('tasks', 'recurrence_rule_id')
    op.drop_column('tasks', 'reminder_time')
    op.drop_column('tasks', 'status')
    op.drop_column('tasks', 'due_time')
    op.drop_column('tasks', 'due_date')
    op.drop_index('ix_reminders_user_id', table_name='reminders')
    op.drop_index('ix_reminders_task_id', table_name='reminders')
    op.drop_table('reminders')
    op.drop_index('ix_recurrence_rules_task_id', table_name='recurrence_rules')
    op.drop_table('recurrence_rules')

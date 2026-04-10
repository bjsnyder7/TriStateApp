"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-09
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="UTC"),
        sa.Column("preferences", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # enums
    project_status = sa.Enum("active", "paused", "completed", "archived", name="project_status")
    priority_level = sa.Enum("critical", "high", "medium", "low", name="priority_level")
    task_status = sa.Enum("todo", "in_progress", "blocked", "done", "cancelled", name="task_status")
    task_priority = sa.Enum("critical", "high", "medium", "low", name="task_priority")
    task_source = sa.Enum("manual", "github_issue", "calendar_event", "ai_generated", name="task_source")
    message_role = sa.Enum("user", "assistant", "tool_call", "tool_result", name="message_role")
    briefing_type = sa.Enum("daily", "weekly", "project_specific", "ad_hoc", name="briefing_type")
    integration_service = sa.Enum("github", "google", "notion", "obsidian", "tavily", name="integration_service")

    project_status.create(op.get_bind())
    priority_level.create(op.get_bind())
    task_status.create(op.get_bind())
    task_priority.create(op.get_bind())
    task_source.create(op.get_bind())
    message_role.create(op.get_bind())
    briefing_type.create(op.get_bind())
    integration_service.create(op.get_bind())

    # projects
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.String(2000)),
        sa.Column("status", sa.Enum("active", "paused", "completed", "archived", name="project_status"), nullable=False, server_default="active"),
        sa.Column("priority", sa.Enum("critical", "high", "medium", "low", name="priority_level"), nullable=False, server_default="medium"),
        sa.Column("deadline", sa.Date),
        sa.Column("github_repos", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("notion_pages", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("tags", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_projects_user_id", "projects", ["user_id"])

    # tasks
    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.String(5000)),
        sa.Column("status", sa.Enum("todo", "in_progress", "blocked", "done", "cancelled", name="task_status"), nullable=False, server_default="todo"),
        sa.Column("priority", sa.Enum("critical", "high", "medium", "low", name="task_priority"), nullable=False, server_default="medium"),
        sa.Column("due_date", sa.Date),
        sa.Column("source", sa.Enum("manual", "github_issue", "calendar_event", "ai_generated", name="task_source"), nullable=False, server_default="manual"),
        sa.Column("source_ref", sa.String(500)),
        sa.Column("assignee", sa.String(255)),
        sa.Column("tags", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_tasks_project_id", "tasks", ["project_id"])
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])

    # conversations
    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id")),
        sa.Column("title", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "conversation_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("role", sa.Enum("user", "assistant", "tool_call", "tool_result", name="message_role"), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("model", sa.String(100)),
        sa.Column("agent_name", sa.String(100)),
        sa.Column("tokens_used", sa.Integer),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_messages_conversation_id", "conversation_messages", ["conversation_id"])

    # briefings
    op.create_table(
        "briefings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.Enum("daily", "weekly", "project_specific", "ad_hoc", name="briefing_type"), nullable=False, server_default="daily"),
        sa.Column("content_md", sa.Text, nullable=False),
        sa.Column("sections", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("delivered_at", sa.DateTime(timezone=True)),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_briefings_user_id", "briefings", ["user_id"])

    # integration_credentials
    op.create_table(
        "integration_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("service", sa.Enum("github", "google", "notion", "obsidian", "tavily", name="integration_service"), nullable=False),
        sa.Column("credentials_encrypted", sa.Text),
        sa.Column("scopes", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("last_synced", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # research_topics
    op.create_table(
        "research_topics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("topic", sa.String(500), nullable=False),
        sa.Column("keywords", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("feeds", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("alert_threshold", sa.String(50), nullable=False, server_default="all"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("research_topics")
    op.drop_table("integration_credentials")
    op.drop_table("briefings")
    op.drop_table("conversation_messages")
    op.drop_table("conversations")
    op.drop_table("tasks")
    op.drop_table("projects")
    op.drop_table("users")

    for name in ["project_status", "priority_level", "task_status", "task_priority",
                 "task_source", "message_role", "briefing_type", "integration_service"]:
        sa.Enum(name=name).drop(op.get_bind())

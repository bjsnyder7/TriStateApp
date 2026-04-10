import uuid
from datetime import datetime, date, timezone
from typing import Optional

from sqlalchemy import DateTime, String, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(5000))
    status: Mapped[str] = mapped_column(
        SAEnum("todo", "in_progress", "blocked", "done", "cancelled", name="task_status"),
        default="todo",
    )
    priority: Mapped[str] = mapped_column(
        SAEnum("critical", "high", "medium", "low", name="task_priority"),
        default="medium",
    )
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    source: Mapped[str] = mapped_column(
        SAEnum("manual", "github_issue", "calendar_event", "ai_generated", name="task_source"),
        default="manual",
    )
    source_ref: Mapped[Optional[str]] = mapped_column(String(500))
    assignee: Mapped[Optional[str]] = mapped_column(String(255))
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    metadata_: Mapped[dict] = mapped_column(JSONB, default=dict, name="metadata")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
    user: Mapped["User"] = relationship("User")

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ResearchTopic(Base):
    __tablename__ = "research_topics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic: Mapped[str] = mapped_column(String(500), nullable=False)
    keywords: Mapped[list] = mapped_column(JSONB, default=list)
    feeds: Mapped[list] = mapped_column(JSONB, default=list)
    alert_threshold: Mapped[str] = mapped_column(String(50), default="all")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship("User", back_populates="research_topics")

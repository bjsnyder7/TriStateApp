import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.briefing import Briefing
from app.models.user import User
from app.schemas.briefing import BriefingResponse

router = APIRouter(prefix="/briefings", tags=["briefings"])


@router.get("", response_model=list[BriefingResponse])
async def list_briefings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Briefing)
        .where(Briefing.user_id == user.id)
        .order_by(Briefing.created_at.desc())
        .limit(30)
    )
    return list(result.scalars().all())


@router.get("/latest", response_model=BriefingResponse)
async def get_latest_briefing(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Briefing)
        .where(Briefing.user_id == user.id)
        .order_by(Briefing.created_at.desc())
        .limit(1)
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No briefings yet")
    return briefing


@router.get("/{briefing_id}", response_model=BriefingResponse)
async def get_briefing(
    briefing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Briefing).where(Briefing.id == briefing_id, Briefing.user_id == user.id)
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Briefing not found")
    return briefing


@router.post("/generate", response_model=BriefingResponse, status_code=status.HTTP_201_CREATED)
async def generate_briefing(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Trigger an on-demand briefing generation. Phase 2 will use the full multi-agent fan-out."""
    from app.agents.orchestrator import OrchestratorAgent
    from app.services.project_service import list_projects

    projects = await list_projects(db, user.id, status="active")
    project_names = ", ".join(p.name for p in projects) or "no active projects"

    orchestrator = OrchestratorAgent(db, user.id)
    full_text = []

    async for event in orchestrator.chat_stream(
        f"Generate a comprehensive daily briefing for me. Cover: my active projects ({project_names}), "
        "any overdue or critical tasks, and recommendations for today's focus.",
        history=[],
    ):
        if event["type"] == "token":
            full_text.append(event["text"])

    content = "".join(full_text)
    briefing = Briefing(
        user_id=user.id,
        type="ad_hoc",
        content_md=content,
        sections={"projects": project_names},
        delivered_at=datetime.now(timezone.utc),
    )
    db.add(briefing)
    await db.commit()
    await db.refresh(briefing)
    return briefing


@router.patch("/{briefing_id}/read", response_model=BriefingResponse)
async def mark_briefing_read(
    briefing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Briefing).where(Briefing.id == briefing_id, Briefing.user_id == user.id)
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Briefing not found")
    briefing.read_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(briefing)
    return briefing

import uuid
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.task import TaskCreate, TaskUpdate


# ── Projects ──────────────────────────────────────────────────────────────────

async def list_projects(db: AsyncSession, user_id: uuid.UUID, status: Optional[str] = None) -> list[Project]:
    q = select(Project).where(Project.user_id == user_id)
    if status:
        q = q.where(Project.status == status)
    q = q.order_by(Project.created_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Project]:
    result = await db.execute(
        select(Project)
        .where(and_(Project.id == project_id, Project.user_id == user_id))
        .options(selectinload(Project.tasks))
    )
    return result.scalar_one_or_none()


async def create_project(db: AsyncSession, user_id: uuid.UUID, data: ProjectCreate) -> Project:
    project = Project(user_id=user_id, **data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


async def archive_project(db: AsyncSession, project: Project) -> Project:
    project.status = "archived"
    await db.commit()
    return project


# ── Tasks ─────────────────────────────────────────────────────────────────────

async def list_tasks(
    db: AsyncSession,
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    status: Optional[str] = None,
) -> list[Task]:
    q = select(Task).where(and_(Task.project_id == project_id, Task.user_id == user_id))
    if status:
        q = q.where(Task.status == status)
    q = q.order_by(Task.created_at.desc())
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_task(db: AsyncSession, task_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Task]:
    result = await db.execute(
        select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def create_task(
    db: AsyncSession,
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    data: TaskCreate,
    source: str = "manual",
    source_ref: Optional[str] = None,
) -> Task:
    task = Task(
        project_id=project_id,
        user_id=user_id,
        source=source,
        source_ref=source_ref,
        **data.model_dump(),
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def update_task(db: AsyncSession, task: Task, data: TaskUpdate) -> Task:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task: Task) -> None:
    await db.delete(task)
    await db.commit()

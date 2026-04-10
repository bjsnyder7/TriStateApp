import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: str = "medium"
    deadline: Optional[date] = None
    github_repos: list[str] = []
    notion_pages: list[str] = []
    tags: list[str] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[date] = None
    github_repos: Optional[list[str]] = None
    notion_pages: Optional[list[str]] = None
    tags: Optional[list[str]] = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    status: str
    priority: str
    deadline: Optional[date]
    github_repos: list
    notion_pages: list
    tags: list
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None


class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: Optional[str]
    project_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    agent_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailResponse(BaseModel):
    id: uuid.UUID
    title: Optional[str]
    project_id: Optional[uuid.UUID]
    created_at: datetime
    messages: list[MessageResponse]

    model_config = {"from_attributes": True}

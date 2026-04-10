import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BriefingResponse(BaseModel):
    id: uuid.UUID
    type: str
    content_md: str
    sections: dict
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

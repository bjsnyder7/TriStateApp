import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.orchestrator import OrchestratorAgent
from app.api.deps import get_current_user, get_db
from app.models.conversation import Conversation, ConversationMessage
from app.models.user import User
from app.schemas.chat import ChatRequest, ConversationDetailResponse, ConversationResponse

router = APIRouter(tags=["chat"])


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .limit(50)
    )
    return list(result.scalars().all())


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == user.id)
        .options(selectinload(Conversation.messages))
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv


@router.post("/chat")
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Get or create conversation
    if body.conversation_id:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.id == body.conversation_id, Conversation.user_id == user.id)
            .options(selectinload(Conversation.messages))
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            user_id=user.id,
            project_id=body.project_id,
            title=body.message[:100],
        )
        db.add(conversation)
        await db.flush()

    # Build message history for the Orchestrator
    history = []
    if body.conversation_id and conversation.messages:
        for msg in conversation.messages:
            if msg.role in ("user", "assistant"):
                history.append({"role": msg.role, "content": msg.content})

    # Save user message
    user_msg = ConversationMessage(
        conversation_id=conversation.id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)
    await db.commit()

    orchestrator = OrchestratorAgent(db, user.id)
    conv_id = str(conversation.id)
    full_response = []

    async def event_stream():
        nonlocal full_response
        # Send conversation ID first so client can track it
        yield f"event: conversation\ndata: {json.dumps({'conversation_id': conv_id})}\n\n"

        async for event in orchestrator.chat_stream(body.message, history):
            if event["type"] == "token":
                full_response.append(event["text"])
                yield f"event: token\ndata: {json.dumps({'text': event['text']})}\n\n"

            elif event["type"] == "agent_call":
                yield f"event: agent_call\ndata: {json.dumps({'agent': event['agent']})}\n\n"

            elif event["type"] == "agent_done":
                yield f"event: agent_done\ndata: {json.dumps({'agent': event['agent'], 'summary': event['summary']})}\n\n"

            elif event["type"] == "done":
                # Persist assistant response
                assistant_text = "".join(full_response)
                assistant_msg = ConversationMessage(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=assistant_text,
                    model=orchestrator.model,
                    tokens_used=event.get("input_tokens", 0) + event.get("output_tokens", 0),
                )
                db.add(assistant_msg)
                await db.commit()

                yield f"event: done\ndata: {json.dumps({'conversation_id': conv_id, 'tokens': event.get('output_tokens', 0)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

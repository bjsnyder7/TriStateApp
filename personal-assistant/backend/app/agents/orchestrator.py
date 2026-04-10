import asyncio
import json
import uuid
from collections.abc import AsyncGenerator
from typing import Optional

import anthropic
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, AgentTask
from app.agents.project_agent import ProjectAgent
from app.config import settings
from app.services import project_service

# Sub-agent tool definitions exposed to the Orchestrator
ORCHESTRATOR_TOOLS = [
    {
        "name": "call_project_agent",
        "description": (
            "Query or update the user's projects and tasks. Use this to: list projects, "
            "get task details, create tasks, update task status, or compute project health."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "instruction": {
                    "type": "string",
                    "description": "Specific instruction for the project agent",
                }
            },
            "required": ["instruction"],
        },
    },
    # Additional sub-agents will be added in Phase 2
]


class OrchestratorAgent:
    """
    The central coordinator. Uses claude-opus-4-6 to understand user intent,
    dispatches sub-agents in parallel, and synthesizes a final streaming response.
    """

    model = settings.orchestrator_model

    def __init__(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        self._db = db
        self._user_id = user_id
        self._client = anthropic.AsyncAnthropic()

    async def _build_system_prompt(self) -> str:
        projects = await project_service.list_projects(self._db, self._user_id, status="active")
        project_summary = "\n".join(
            f"- {p.name} (priority: {p.priority}, deadline: {p.deadline or 'none'})"
            for p in projects
        ) or "No active projects yet."

        return f"""You are a highly capable personal AI assistant. Your job is to help the user be maximally effective with their time and deeply informed about topics they care about.

## User's Active Projects
{project_summary}

## Your Capabilities
You have access to sub-agents for specialized tasks. Use them proactively:
- **call_project_agent**: Query/update projects and tasks

When relevant, call multiple sub-agents in parallel to gather comprehensive information before responding.

## Guidelines
- Be concise but thorough
- Proactively surface blockers, deadlines, and priorities
- When creating tasks, confirm with the user before doing so unless they explicitly asked
- Always cite which agent provided which information
- Format responses with markdown for readability
"""

    async def chat_stream(
        self,
        message: str,
        history: list[dict],
    ) -> AsyncGenerator[dict, None]:
        """
        Stream a response to a user message.
        Yields dicts with type: 'token' | 'agent_call' | 'agent_done' | 'done'
        """
        system_prompt = await self._build_system_prompt()

        messages = history + [{"role": "user", "content": message}]

        # Phase 1: non-streaming tool-use loop to gather sub-agent data
        full_response_text = ""
        tool_call_count = 0

        while True:
            response = await self._client.messages.create(
                model=self.model,
                max_tokens=8192,
                system=system_prompt,
                tools=ORCHESTRATOR_TOOLS,
                messages=messages,
            )

            if response.stop_reason == "tool_use":
                messages.append({"role": "assistant", "content": response.content})

                # Gather all tool calls to dispatch in parallel
                tool_calls = [b for b in response.content if b.type == "tool_use"]

                # Notify client which agents are being called
                for block in tool_calls:
                    yield {"type": "agent_call", "agent": block.name, "id": block.id}

                # Dispatch sub-agents (parallel in Phase 2; sequential for now with one agent)
                results = await asyncio.gather(
                    *[self._dispatch_agent(block.name, block.input) for block in tool_calls],
                    return_exceptions=True,
                )

                tool_results = []
                for block, result in zip(tool_calls, results):
                    if isinstance(result, Exception):
                        content = json.dumps({"error": str(result)})
                    else:
                        content = json.dumps({"summary": result.summary, "data": result.data})
                        yield {"type": "agent_done", "agent": block.name, "summary": result.summary}

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": content,
                    })

                messages.append({"role": "user", "content": tool_results})
                tool_call_count += 1

            elif response.stop_reason == "end_turn":
                # Stream the final response token by token using a streaming call
                async with self._client.messages.stream(
                    model=self.model,
                    max_tokens=8192,
                    system=system_prompt,
                    messages=messages,
                ) as stream:
                    async for text in stream.text_stream:
                        full_response_text += text
                        yield {"type": "token", "text": text}

                usage = response.usage
                yield {
                    "type": "done",
                    "full_text": full_response_text,
                    "input_tokens": usage.input_tokens,
                    "output_tokens": usage.output_tokens,
                }
                break
            else:
                break

    async def _dispatch_agent(self, agent_name: str, agent_input: dict) -> AgentResult:
        task = AgentTask(
            instruction=agent_input.get("instruction", ""),
            context=agent_input,
        )
        if agent_name == "call_project_agent":
            agent = ProjectAgent(self._db, self._user_id)
            return await agent.run(task)

        return AgentResult(
            agent_name=agent_name,
            summary="Agent not yet implemented",
            error="Not implemented in Phase 1",
        )

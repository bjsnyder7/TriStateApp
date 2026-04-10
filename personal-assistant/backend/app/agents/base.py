from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

import anthropic


@dataclass
class AgentTask:
    """Input to a sub-agent."""
    instruction: str
    context: dict = field(default_factory=dict)


@dataclass
class AgentResult:
    """Output from a sub-agent."""
    agent_name: str
    summary: str
    data: dict = field(default_factory=dict)
    error: str | None = None


class BaseAgent(ABC):
    name: str
    description: str
    model: str
    system_prompt: str
    tools: list[dict]

    def __init__(self) -> None:
        self._client = anthropic.AsyncAnthropic()

    @abstractmethod
    async def run(self, task: AgentTask) -> AgentResult:
        """Execute the agent with a given task and return structured results."""
        ...

    async def _call_claude(
        self,
        messages: list[dict],
        max_tokens: int = 4096,
    ) -> anthropic.types.Message:
        return await self._client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=self.system_prompt,
            tools=self.tools,
            messages=messages,
        )

    async def _run_tool_loop(self, messages: list[dict], max_tokens: int = 4096) -> str:
        """Run the standard tool-use loop and return the final text response."""
        while True:
            response = await self._call_claude(messages, max_tokens)

            if response.stop_reason == "end_turn":
                for block in response.content:
                    if hasattr(block, "text"):
                        return block.text
                return ""

            if response.stop_reason == "tool_use":
                # Add assistant message with tool calls
                messages.append({"role": "assistant", "content": response.content})

                # Process each tool call
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        result = await self._handle_tool_call(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(result),
                        })

                messages.append({"role": "user", "content": tool_results})
            else:
                break

        return ""

    async def _handle_tool_call(self, tool_name: str, tool_input: dict) -> Any:
        """Override in subclasses to handle specific tool calls."""
        return {"error": f"Unknown tool: {tool_name}"}

import json
import uuid
from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, AgentTask, BaseAgent
from app.agents.tools.project_tools import PROJECT_TOOLS
from app.config import settings
from app.services import project_service
from app.schemas.task import TaskCreate, TaskUpdate


class ProjectAgent(BaseAgent):
    name = "project_agent"
    description = "Manages projects and tasks from the internal database. Source of truth for all project data."
    model = settings.subagent_model
    system_prompt = """You are the Project Agent for a personal AI assistant.
Your job is to query and update the user's projects and tasks database.
Use the available tools to answer questions about project status, create tasks, and update task statuses.
Always return structured, factual information based on the database.
Be concise and specific in your responses."""

    tools = PROJECT_TOOLS

    def __init__(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        super().__init__()
        self._db = db
        self._user_id = user_id

    async def run(self, task: AgentTask) -> AgentResult:
        messages = [{"role": "user", "content": task.instruction}]
        try:
            response_text = await self._run_tool_loop(messages)
            return AgentResult(
                agent_name=self.name,
                summary=response_text,
                data=task.context,
            )
        except Exception as e:
            return AgentResult(agent_name=self.name, summary="", error=str(e))

    async def _handle_tool_call(self, tool_name: str, tool_input: dict):
        if tool_name == "list_projects":
            projects = await project_service.list_projects(
                self._db, self._user_id, status=tool_input.get("status")
            )
            return [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "status": p.status,
                    "priority": p.priority,
                    "deadline": p.deadline.isoformat() if p.deadline else None,
                    "tags": p.tags,
                }
                for p in projects
            ]

        if tool_name == "get_project_detail":
            project = await project_service.get_project(
                self._db, uuid.UUID(tool_input["project_id"]), self._user_id
            )
            if not project:
                return {"error": "Project not found"}
            tasks = await project_service.list_tasks(self._db, project.id, self._user_id)
            return {
                "id": str(project.id),
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "priority": project.priority,
                "deadline": project.deadline.isoformat() if project.deadline else None,
                "tasks": [
                    {
                        "id": str(t.id),
                        "title": t.title,
                        "status": t.status,
                        "priority": t.priority,
                        "due_date": t.due_date.isoformat() if t.due_date else None,
                    }
                    for t in tasks
                ],
            }

        if tool_name == "create_task":
            due_date = None
            if tool_input.get("due_date"):
                due_date = date.fromisoformat(tool_input["due_date"])
            task_data = TaskCreate(
                title=tool_input["title"],
                description=tool_input.get("description"),
                priority=tool_input.get("priority", "medium"),
                due_date=due_date,
            )
            task = await project_service.create_task(
                self._db,
                uuid.UUID(tool_input["project_id"]),
                self._user_id,
                task_data,
                source=tool_input.get("source", "ai_generated"),
            )
            return {"id": str(task.id), "title": task.title, "status": task.status}

        if tool_name == "update_task_status":
            task = await project_service.get_task(
                self._db, uuid.UUID(tool_input["task_id"]), self._user_id
            )
            if not task:
                return {"error": "Task not found"}
            updated = await project_service.update_task(
                self._db, task, TaskUpdate(status=tool_input["status"])
            )
            return {"id": str(updated.id), "status": updated.status}

        if tool_name == "compute_project_health":
            project = await project_service.get_project(
                self._db, uuid.UUID(tool_input["project_id"]), self._user_id
            )
            if not project:
                return {"error": "Project not found"}
            tasks = await project_service.list_tasks(self._db, project.id, self._user_id)
            today = date.today()
            total = len(tasks)
            done = sum(1 for t in tasks if t.status == "done")
            blocked = sum(1 for t in tasks if t.status == "blocked")
            overdue = sum(
                1 for t in tasks
                if t.due_date and t.due_date < today and t.status not in ("done", "cancelled")
            )
            if total == 0:
                health = "no_tasks"
            elif blocked > 0 or overdue > 0:
                health = "at_risk"
            elif done / total >= 0.8:
                health = "on_track"
            else:
                health = "in_progress"
            return {
                "health": health,
                "total_tasks": total,
                "done": done,
                "blocked": blocked,
                "overdue": overdue,
            }

        return {"error": f"Unknown tool: {tool_name}"}

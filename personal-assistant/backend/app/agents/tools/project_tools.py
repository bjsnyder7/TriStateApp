PROJECT_TOOLS = [
    {
        "name": "list_projects",
        "description": "List all projects for the user, optionally filtered by status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["active", "paused", "completed", "archived"],
                    "description": "Filter by project status. Omit for all projects.",
                }
            },
        },
    },
    {
        "name": "get_project_detail",
        "description": "Get full details of a project including all its tasks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "description": "UUID of the project"}
            },
            "required": ["project_id"],
        },
    },
    {
        "name": "create_task",
        "description": "Create a new task in a project.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "priority": {"type": "string", "enum": ["critical", "high", "medium", "low"]},
                "due_date": {"type": "string", "description": "ISO date string YYYY-MM-DD"},
                "source": {"type": "string", "enum": ["manual", "ai_generated"]},
            },
            "required": ["project_id", "title"],
        },
    },
    {
        "name": "update_task_status",
        "description": "Update the status of a task.",
        "input_schema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "string"},
                "status": {"type": "string", "enum": ["todo", "in_progress", "blocked", "done", "cancelled"]},
            },
            "required": ["task_id", "status"],
        },
    },
    {
        "name": "compute_project_health",
        "description": "Compute the health score of a project based on task completion, overdue items, and blocked tasks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"}
            },
            "required": ["project_id"],
        },
    },
]

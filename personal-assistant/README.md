# Personal AI Assistant

A personal AI assistant that helps you manage projects, generates daily briefings, monitors research topics, and connects to GitHub, Google Calendar/Gmail, and Notion.

## Architecture

Multi-agent system powered by the Anthropic Claude API:
- **OrchestratorAgent** (claude-opus-4-6) — coordinates all sub-agents
- **ProjectAgent** — manages projects/tasks from PostgreSQL
- **GitHubAgent** — PRs, issues, repo activity *(Phase 2)*
- **CalendarAgent** — Google Calendar + Gmail *(Phase 2)*
- **ResearchAgent** — Tavily + RSS topic monitoring *(Phase 2)*
- **NotesAgent** — Notion integration *(Phase 2)*

## Stack

- **Backend**: Python + FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL + Redis
- **AI**: Anthropic `anthropic` SDK (claude-opus-4-6 + claude-sonnet-4-6)
- **Background jobs**: ARQ
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY at minimum

# 2. Start infrastructure
docker-compose up postgres redis -d

# 3. Run backend migrations
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload

# 4. Run web app
cd ../web
npm install
npm run dev
```

Open http://localhost:3000

## Phases

- **Phase 1** (current): Core backend, auth, projects/tasks CRUD, single-agent chat with ProjectAgent
- **Phase 2**: All 5 integrations, full multi-agent, daily briefings via ARQ
- **Phase 3**: Web polish, production hardening, proactive insights

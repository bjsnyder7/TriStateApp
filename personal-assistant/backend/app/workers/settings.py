from arq import cron
from app.config import settings


async def startup(ctx):
    from app.database import engine
    ctx["engine"] = engine


async def shutdown(ctx):
    pass


class WorkerSettings:
    redis_settings = settings.redis_url
    on_startup = startup
    on_shutdown = shutdown
    # Phase 2: add briefing_job, sync_job, research_job here
    functions = []
    cron_jobs = []

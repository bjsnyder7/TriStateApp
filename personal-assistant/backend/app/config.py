from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    secret_key: str = "dev-secret-key-change-in-production"
    encryption_key: str = ""
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://assistant:assistant@localhost:5432/assistant"
    redis_url: str = "redis://localhost:6379/0"

    # Anthropic
    anthropic_api_key: str = ""
    orchestrator_model: str = "claude-opus-4-6"
    subagent_model: str = "claude-sonnet-4-6"

    # GitHub
    github_token: str = ""
    github_webhook_secret: str = ""

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/integrations/google/callback"

    # Notion
    notion_token: str = ""

    # Tavily
    tavily_api_key: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    # JWT
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 30


settings = Settings()

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/xyz_ai"
    
    @property
    def async_database_url(self) -> str:
        """Ensure DATABASE_URL uses asyncpg driver for SQLAlchemy async."""
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url
    
    # JWT Security
    jwt_secret: str = "your-super-secret-jwt-key-change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    
    # AI Provider
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-haiku-20240307"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173,https://xyz-ai-human-like-ai-school-assista.vercel.app"
    
    # Application
    app_name: str = "XYZ AI School Assistant"
    app_version: str = "1.0.0"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

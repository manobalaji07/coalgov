import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CoalGov AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "coalgov-super-secret-key-sih2026-hackathon-win")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./coalgov.db"
    )

    class Config:
        case_sensitive = True

settings = Settings()

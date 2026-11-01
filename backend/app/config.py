import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicPulse AI - Smart City Grievance Resolution"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./civicpulse.db"
    
    # LLM Settings (supports OpenAI, Groq, Anthropic or smart heuristic fallback)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # 'openai', 'groq', 'anthropic', or 'auto'
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Clustering threshold in meters
    CLUSTER_RADIUS_METERS: float = 100.0
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

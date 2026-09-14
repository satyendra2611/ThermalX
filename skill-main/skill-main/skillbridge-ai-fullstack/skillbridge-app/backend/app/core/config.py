from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
model_config = SettingsConfigDict(
env_file=".env",
extra="ignore"
)

```
# Database — falls back to a local SQLite file if MySQL isn't configured,
# so the API is runnable immediately for hackathon demos.
DATABASE_URL: str = "sqlite:///./skillbridge.db"

SECRET_KEY: str = "dev-secret-change-me"
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

# API Keys — loaded from backend/.env
GROQ_API_KEY: str = ""
TEXTBEE_API_KEY: str = ""
TEXTBEE_DEVICE_ID: str = ""

GOOGLE_CLIENT_ID: str = ""
GOOGLE_CLIENT_SECRET: str = ""

CORS_ORIGINS: str = "http://localhost:5173"

@property
def cors_origin_list(self) -> list[str]:
    return [
        origin.strip()
        for origin in self.CORS_ORIGINS.split(",")
        if origin.strip()
    ]
```

@lru_cache
def get_settings() -> Settings:
return Settings()

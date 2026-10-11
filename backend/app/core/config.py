from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMMA_API_KEY: str = ""
    GEMMA_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    GEMMA_MODEL_ID: str = "models/gemma-4-31b-it"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()


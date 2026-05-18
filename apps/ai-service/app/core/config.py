from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    database_url: str = "postgresql://procura:procura_dev@localhost:5432/procura"
    ocr_engine: str = "tesseract"
    log_level: str = "INFO"
    sentry_dsn: str = ""

    model_class: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    max_tokens: int = 4096
    temperature: float = 0.1

    class Config:
        env_file = ".env"


settings = Settings()

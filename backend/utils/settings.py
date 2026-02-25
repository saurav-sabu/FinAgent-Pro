# Import BaseSettings and SettingsConfigDict from pydantic_settings
from pydantic_settings import BaseSettings, SettingsConfigDict

# Settings class for managing application configuration from environment variables
class Settings(BaseSettings):
    # Load configuration from .env file, ignore extra environment variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # LLM model identifier
    MODEL_ID: str

    # Temperature parameter for controlling model output randomness (0.0-1.0)
    TEMPERATURE: float

    # API key for Anthropic Claude API authentication
    ANTHROPIC_API_KEY: str


# Global settings instance used throughout the application
settings = Settings()
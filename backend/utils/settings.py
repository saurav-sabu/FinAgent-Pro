"""
Application settings and configuration management.

This module uses Pydantic Settings to load configuration from environment variables
and .env file. All settings are validated and type-checked at startup.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and .env file.
    
    This class manages all configuration required for the FinAgent application,
    including API keys, model settings, and other runtime parameters.
    
    Configuration is loaded from:
    1. Environment variables (highest priority)
    2. .env file in the project root
    3. Default values (if specified)
    
    Attributes:
        MODEL_ID (str): Claude model identifier (e.g., 'claude-3-5-sonnet-20241022').
                       Required environment variable.
        TEMPERATURE (float): Model temperature for controlling response randomness.
                            Range: 0.0 (deterministic) to 1.0 (creative).
                            Required environment variable.
        ANTHROPIC_API_KEY (str): API key for authenticating with Anthropic Claude API.
                                Required environment variable.
    """
    # Configure Pydantic to load from .env file and ignore extra environment variables
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # LLM model identifier (e.g., 'claude-3-5-sonnet-20241022')
    MODEL_ID: str

    # Temperature parameter for controlling model output randomness (0.0-1.0)
    # Lower values = more deterministic, Higher values = more creative
    TEMPERATURE: float

    # API key for Anthropic Claude API authentication
    ANTHROPIC_API_KEY: str

    NEWSAPI_KEY: str

    MARKETAUX_API_KEY: str




# Global settings instance used throughout the application
# This is initialized when the module is imported and reads from .env/environment
settings = Settings()
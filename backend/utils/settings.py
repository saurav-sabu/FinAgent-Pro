"""
Application settings and configuration management.

This module uses Pydantic Settings to load configuration from environment variables
and .env file. All settings are validated and type-checked at startup.
"""

from typing import List
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
    # Configure Pydantic to load from .env file inside the backend folder
    model_config = SettingsConfigDict(env_file="backend/.env", extra="ignore")

    # LLM model identifier (e.g., 'claude-3-5-sonnet-20241022')
    MODEL_ID: str

    # Temperature parameter for controlling model output randomness (0.0-1.0)
    # Lower values = more deterministic, Higher values = more creative
    TEMPERATURE: float

    # API key for Anthropic Claude API authentication
    ANTHROPIC_API_KEY: str

    # NewsAPI key (https://newsapi.org) — used for India region news
    NEWSAPI_KEY: str

    # MarketAux API token (https://marketaux.com) — used for US/global news
    MARKETAUX_API_KEY: str

    # NeonDB Connection URL
    DATABASE_URL: str

    # JWT Authentication signing secret
    SECRET_KEY: str

    # Finnhub API Key for live Macroeconomic Calendar
    FINNHUB_API_KEY: str = ""

    # Allowed CORS origins (comma-separated string in .env, list of strings in Python)
    # Defaulting to common development ports
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ]




# Global settings instance used throughout the application
# This is initialized when the module is imported and reads from .env/environment
settings = Settings()
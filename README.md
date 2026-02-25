# FinAgent-Pro

A financial AI agent application built with Python and Pydantic.

## Today's Updates

### Settings Configuration Implementation
- Created `backend/utils/settings.py` with centralized application configuration management
- Implemented `Settings` class using Pydantic's `BaseSettings` for environment variable management
- Configured automatic loading from `.env` file with ignored extra variables

#### Configuration Parameters
- **MODEL_ID**: LLM model identifier for AI operations
- **TEMPERATURE**: Model output randomness control (range: 0.0-1.0)
- **ANTHROPIC_API_KEY**: Anthropic Claude API authentication key

#### Usage
```python
from backend.utils.settings import settings

# Access configuration values
model = settings.MODEL_ID
temperature = settings.TEMPERATURE
api_key = settings.ANTHROPIC_API_KEY
```

## Setup Instructions

1. Create a `.env` file in the project root with the following variables:
   ```
   MODEL_ID=<your-model-id>
   TEMPERATURE=<0.0-1.0>
   ANTHROPIC_API_KEY=<your-api-key>
   ```

2. Install dependencies:
   ```
   pip install pydantic-settings
   ```

3. The global `settings` instance is available for import throughout the application.

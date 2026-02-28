"""
Finance Agent Controller Module.

This module contains the FinanceAgent class that wraps the Agno AI agent
with financial analysis capabilities using Claude model and yfinance tools.
"""

from datetime import datetime

from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools.yfinance import YFinanceTools

from backend.utils.constants import FINANCE_AGENT_INSTRUCTIONS
from backend.utils.logger import logger
from backend.utils.settings import settings


class FinanceAgent:
    """
    Finance Agent for analyzing stocks, sectors, and financial markets.
    
    This class initializes an AI agent powered by Claude (Anthropic) that can:
    - Analyze individual stocks and their financial metrics
    - Compare multiple stocks or companies
    - Provide sector and market analysis
    - Fetch real-time market data using yfinance tools
    
    Attributes:
        model: Claude model instance for AI processing
        yfinance: YFinanceTools instance for fetching market data
        agent: Agno Agent instance configured for financial analysis
    """

    def __init__(self, model_id: str = None, temperature: float = None):
        """
        Initialize the Finance Agent with Claude model and yfinance tools.
        
        Args:
            model_id (str, optional): Claude model identifier (e.g., 'claude-3-5-sonnet-20241022').
                                     If not provided, uses MODEL_ID from settings.
            temperature (float, optional): Model temperature for response randomness (0.0-1.0).
                                          If not provided, uses TEMPERATURE from settings.
        """
        # Use provided values or fall back to settings defaults
        model_id = model_id or settings.MODEL_ID
        temperature = temperature if temperature is not None else settings.TEMPERATURE

        # Initialize Claude model with API key from settings (required for Anthropic auth)
        self.model = Claude(
            id=model_id,
            temperature=temperature,
            api_key=settings.ANTHROPIC_API_KEY,
        )
        
        # Initialize yfinance tools for fetching stock market data
        self.yfinance = YFinanceTools()

        # Create Agno agent with financial analysis capabilities
        self.agent = Agent(
            name="Finance Analyst",
            model=self.model,
            tools=[self.yfinance],  # Enable yfinance tools for market data access
            instructions=FINANCE_AGENT_INSTRUCTIONS,  # Expert financial analyst instructions
            markdown=True  # Enable markdown formatting in responses
        )

        logger.info(f"Finance Agent initialized with model: {model_id}")

    async def analyze(self, query: str):
        """
        Analyze a financial query using the AI agent.
        
        Processes user queries about stocks, sectors, or markets and returns
        comprehensive financial analysis with real-time data.
        
        Args:
            query (str): User query about stocks, sectors, or financial markets.
                        Examples: "Analyze AAPL", "Compare TSLA and NVDA", 
                                 "What's the outlook for tech sector?"
        
        Returns:
            str: AI-generated financial analysis in markdown format, or error message
                 if analysis fails.
        """
        # Clean and validate input query
        query = query.strip()

        if not query:
            return "Please enter a query"
        
        try:
            # Add current timestamp to provide context-aware analysis
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M %Z")
            prompt = f"[Current date and time: {current_time}]\n\n{query}"

            logger.info(f"Starting analysis for: {query[:50]}...")

            # Run the agent asynchronously with the enhanced prompt
            response = await self.agent.arun(prompt)

            # Validate response content
            if response.content is None:
                return "No response received from the agent. Please try again.."
            
            return response.content
        
        except Exception as e:
            # Log error and return user-friendly error message
            logger.error(f"Error during analysis: {str(e)}")

            return (
                f"❌ Error during analysis: {str(e)}.\n\n"
                "Please check:\n"
                "- Your API Key is set in .env (ANTHROPIC_API_KEY)\n"
                "- The stock ticker is valid\n"
                "- Your internet connection is active."
            )
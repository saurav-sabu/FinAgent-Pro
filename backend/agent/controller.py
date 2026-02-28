from datetime import datetime

from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools.yfinance import YFinanceTools

from backend.utils.constants import FINANCE_AGENT_INSTRUCTIONS
from backend.utils.logger import logger
from backend.utils.settings import settings

class FinanceAgent:

    def __init__(self,model_id:str=None,temperature:float=None):
        
        model_id = model_id or settings.MODEL_ID
        temperature = temperature if temperature is not None else settings.TEMPERATURE

        self.model = Claude(id=model_id,temperature=temperature)
        self.yfinance = YFinanceTools()

        self.agent = Agent(
            name = "Finance Analyst",
            model = self.model,
            tools = [self.yfinance],
            instructions=FINANCE_AGENT_INSTRUCTIONS,
            markdown=True
        )

        logger.info("Finance Initialized with model: {model_id}")


    async def analyze(self, query:str):

        query = query.strip()

        if not query:
            return "Please enter a query"
        
        try:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M %Z")
            prompt = f"[Current date and time: {current_time}]\n\n{query}"

            logger.info(f"Starting analysis for: {query[:50]}...")

            response = await self.agent.arun(prompt)

            if response.content is None:
                return "No response received from the agent. Please try again.."
            
            return response.content
        
        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")

            return (
                f"❌ Error during analysis: {str(e)}.\n\n"
                "Please check:\n"
                "- Your API Key is set in .env (ANTHROPIC_API_KEY)\n"
                "- The stock ticker is valid\n"
                "- Your internet connection is active."
            )
import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import datetime
import httpx

from backend.utils.logger import logger
from backend.utils.cache import ttl_cache
from backend.utils.settings import settings

class AnalyticsService:
    """
    Service for retrieving deep financial analytics data.
    """

    REGIONAL_SECTORS = {
        "US": {
            "Technology": "XLK",
            "Financials": "XLF",
            "Healthcare": "XLV",
            "Energy": "XLE",
            "Consumer": "XLY",
            "Industrial": "XLI"
        },
        "India": {
            "IT": "^CNXIT",
            "Financials": "^CNXFIN",
            "Pharma": "^CNXPHARMA",
            "Energy": "^CNXENERGY",
            "FMCG": "^CNXFMCG",
            "Auto": "^CNXAUTO",
            "Metals": "^CNXMETAL"
        },
        "Europe": {
            "Technology": "EXV3.DE",
            "Financials": "EXV1.DE",
            "Healthcare": "EXV4.DE",
            "Energy": "EXV5.DE",
            "Consumer": "EXV2.DE",
            "Industrials": "EXV6.DE"
        },
        "China": {
            "Consumer": "CHIQ",
            "Internet/Tech": "KWEB",
            "Broad Market": "MCHI",
            "A-Shares": "ASHR",
            "Dividend": "KBA"
        }
    }

    @ttl_cache(ttl_seconds=3600)  # Cache for 1 hour to prevent YFinance abuse
    async def get_fundamental_data(self, ticker: str) -> Dict[str, Any]:
        """
        Retrieves financial statements, key ratios, and company profile.
        """
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            if not info or "regularMarketPrice" not in info and "currentPrice" not in info and "previousClose" not in info:
                 raise ValueError(f"Ticker {ticker} not found or has no fundamental data")

            # Basic Company Info
            profile = {
                "name": info.get("longName", ticker),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "description": info.get("longBusinessSummary", ""),
                "website": info.get("website", ""),
                "employees": info.get("fullTimeEmployees", 0),
                "country": info.get("country", "")
            }

            # Key Ratios
            ratios = {
                "pe_ratio": round(info.get("trailingPE", 0) or 0, 2),
                "forward_pe": round(info.get("forwardPE", 0) or 0, 2),
                "peg_ratio": round(info.get("pegRatio", 0) or 0, 2),
                "price_to_book": round(info.get("priceToBook", 0) or 0, 2),
                "debt_to_equity": round(info.get("debtToEquity", 0) or 0, 2),
                "return_on_equity": round((info.get("returnOnEquity", 0) or 0) * 100, 2), # Percentage
                "return_on_assets": round((info.get("returnOnAssets", 0) or 0) * 100, 2),
                "profit_margin": round((info.get("profitMargins", 0) or 0) * 100, 2),
                "operating_margin": round((info.get("operatingMargins", 0) or 0) * 100, 2),
                "dividend_yield": round((info.get("dividendYield", 0) or 0) * 100, 2),
                "beta": round(info.get("beta", 1.0) or 1.0, 2)
            }

            # Function to safely parse a pandas DataFrame into a list of dicts for JSON serialization
            def parse_financials(df):
                if df is None or df.empty:
                    return []
                # Keep only the last 4 periods (years/quarters)
                df = df.iloc[:, :4]
                # Convert Timestamp columns to string dates
                df.columns = [c.strftime('%Y-%m-%d') if isinstance(c, pd.Timestamp) else str(c) for c in df.columns]
                
                result = []
                for index, row in df.iterrows():
                    # Format large numbers cleanly
                    formatted_row = {"metric": str(index)}
                    for col in df.columns:
                        val = row[col]
                        if pd.isna(val):
                            formatted_row[col] = None
                        else:
                            formatted_row[col] = float(val)
                    result.append(formatted_row)
                return result

            income_statement = parse_financials(stock.financials)
            balance_sheet = parse_financials(stock.balance_sheet)
            cash_flow = parse_financials(stock.cashflow)

            return {
                "profile": profile,
                "ratios": ratios,
                "income_statement": income_statement,
                "balance_sheet": balance_sheet,
                "cash_flow": cash_flow,
            }

        except Exception as e:
            logger.error(f"Error fetching fundamentals for {ticker}: {str(e)}")
            raise ValueError(f"Failed to retrieve fundamental data for {ticker}")

    @ttl_cache(ttl_seconds=300) # Cache for 5 minutes
    async def get_technical_indicators(self, ticker: str, period: str = "1y") -> Dict[str, Any]:
        """
        Calculates MACD, Bollinger Bands, and Stochastic Oscillator for a given ticker.
        """
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period)

            if hist.empty:
                 raise ValueError(f"No historical data found for {ticker}")

            # Calculate MACD (12, 26, 9)
            exp1 = hist['Close'].ewm(span=12, adjust=False).mean()
            exp2 = hist['Close'].ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9, adjust=False).mean()
            histogram = macd - signal

            # Calculate Bollinger Bands (20, 2)
            sma20 = hist['Close'].rolling(window=20).mean()
            std20 = hist['Close'].rolling(window=20).std()
            upper_band = sma20 + (std20 * 2)
            lower_band = sma20 - (std20 * 2)

            # Calculate Stochastic Oscillator (14, 3, 3)
            low14 = hist['Low'].rolling(window=14).min()
            high14 = hist['High'].rolling(window=14).max()
            percent_k = 100 * ((hist['Close'] - low14) / (high14 - low14))
            percent_d = percent_k.rolling(window=3).mean()

            # Helper function to clean data for JSON
            def clean_series(series):
                # Round first while it's still numeric, then replace NaNs/Infs with None for JSON serialization
                return series.round(4).replace([np.inf, -np.inf, np.nan], None).tolist()

            dates = hist.index.strftime('%Y-%m-%d').tolist()

            return {
                "ticker": ticker.upper(),
                "dates": dates,
                "price": clean_series(hist['Close']),
                "volume": clean_series(hist['Volume']),
                "macd": {
                    "macd_line": clean_series(macd),
                    "signal_line": clean_series(signal),
                    "histogram": clean_series(histogram)
                },
                "bollinger_bands": {
                    "middle_band": clean_series(sma20),
                    "upper_band": clean_series(upper_band),
                    "lower_band": clean_series(lower_band)
                },
                "stochastic": {
                    "k_line": clean_series(percent_k),
                    "d_line": clean_series(percent_d)
                }
            }

        except Exception as e:
            logger.error(f"Error calculating technicals for {ticker}: {str(e)}")
            raise ValueError(f"Failed to calculate technical indicators for {ticker}")

    @ttl_cache(ttl_seconds=3600)
    async def get_economic_calendar(self) -> List[Dict[str, Any]]:
        """
        Returns a live economic calendar powered by Finnhub API.
        """
        if not settings.FINNHUB_API_KEY:
            logger.warning("Finnhub API key not configured. Cannot load external calendar data.")
            return []

        today = datetime.date.today()
        end_date = today + datetime.timedelta(days=7) # Look ahead 1 week

        url = f"https://finnhub.io/api/v1/calendar/economic"
        params = {
            "from": today.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d"),
            "token": settings.FINNHUB_API_KEY
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()

            calendar_data = []
            events = data.get("economicCalendar", [])
            
            # Map Finnhub structure to our Frontend React Table format
            for i, event in enumerate(events):
                # Filter out minor impact to reduce noise if preferred (Low, Medium, High)
                impact_mapping = {"low": "Low", "medium": "Medium", "high": "High"}
                impact = impact_mapping.get(event.get("impact", "").lower(), "Low")

                calendar_data.append({
                    "id": str(i),
                    "date": event.get("time", ""),
                    "event": event.get("event", "Unknown Event"),
                    "country": event.get("country", "US"),
                    "impact": impact,
                    "forecast": str(event.get("estimate", "-")) or "-",
                    "previous": str(event.get("previous", "-")) or "-"
                })

            # Sort by date
            calendar_data.sort(key=lambda x: x["date"])
            return calendar_data

        except Exception as e:
            logger.error(f"Failed to fetch Finnhub Calendar: {e}")
            return []

    @ttl_cache(ttl_seconds=3600)
    async def get_sector_performance(self, region: str = "US") -> Dict[str, float]:
        """
        Fetch recent performance for standard regional Sector ETFs and Indices.
        """
        if region not in self.REGIONAL_SECTORS:
            region = "US"
            
        sectors = self.REGIONAL_SECTORS[region]
        data: Dict[str, float] = {}
        
        for name, symbol in sectors.items():
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d")
                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data[name] = round(change_pct, 2)
            except Exception as e:
                logger.warning(f"Failed to fetch sector {name} for {region}: {e}")
                
        # Sort sectors by highest percentage return
        sorted_data = dict(sorted(data.items(), key=lambda item: item[1], reverse=True))
        return sorted_data


analytics_service = AnalyticsService()

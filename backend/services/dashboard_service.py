import yfinance as yf
import pandas as pd
from typing import Dict, List, Any

import yfinance as yf
import pandas as pd

from backend.utils.logger import logger


class DashboardService:
    """
    Service for building a market dashboard view.

    Aggregates:
    - Major index performance
    - Trending tickers
    - Detailed stats and risk analysis for a specific ticker
    """

    INDICES = {
        "S&P 500": "^GSPC",
        "NASDAQ": "^IXIC",
        "Dow Jones": "^DJI",
        "Nifty 50": "^NSEI",
        "Sensex": "^BSESN",
    }

    TRENDING_TICKERS = [
        "TSLA",
        "NVDA",
        "AAPL",
        "MSFT",
        "META",
        "AMZN",
        "GOOGL",
    ]

    def _calculate_rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        """
        Calculate Relative Strength Index (RSI) for a price series.
        """
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    async def get_dashboard_data(self, ticker: str) -> Dict[str, Any]:
        """
        Build the full dashboard payload for a given ticker.

        Returns a dict matching DashboardResponse:
        - indices: {index_name: change_percent}
        - trending: {"gainers": [...], "losers": [...]}
        - stock_lookup: stock detail dict
        - risk_score: risk analysis dict
        - volume_alert: bool

        Raises:
            ValueError: when the ticker cannot be found.
        """
        ticker = ticker.upper()

        indices_data = self._get_indices_data()
        trending_data = self._get_trending_data()

        gainers = sorted(
            trending_data, key=lambda x: x["change_percent"], reverse=True
        )[:3]
        losers = sorted(trending_data, key=lambda x: x["change_percent"])[:3]

        stock_data = self._get_stock_details(ticker)

        return {
            "indices": indices_data,
            "trending": {
                "gainers": gainers,
                "losers": losers,
            },
            "stock_lookup": stock_data["details"],
            "risk_score": stock_data["risk"],
            "volume_alert": stock_data["volume_alert"],
        }

    def _get_indices_data(self) -> Dict[str, float]:
        """
        Fetch recent performance (5 trading days) for major indices.
        """
        data: Dict[str, float] = {}
        for name, symbol in self.INDICES.items():
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d")
                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data[name] = round(change_pct, 2)
            except Exception as e:
                logger.warning(f"Failed to fetch index {name}: {e}")
        return data

    def _get_trending_data(self) -> List[Dict[str, Any]]:
        """
        Fetch recent performance for a fixed list of trending tickers.
        """
        data: List[Dict[str, Any]] = []
        for symbol in self.TRENDING_TICKERS:
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d")
                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data.append(
                        {
                            "ticker": symbol,
                            "price": round(current_close, 2),
                            "change_percent": round(change_pct, 2),
                        }
                    )
            except Exception as e:
                logger.warning(f"Failed to fetch trending ticker {symbol}: {e}")
        return data

    def _get_stock_details(self, ticker: str) -> Dict[str, Any]:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="6mo")

        if hist.empty:
            raise ValueError(f"{ticker} not found")

        latest = hist.iloc[-1]
        prev = hist.iloc[-2]

        price_change = latest["Close"] - prev["Close"]
        price_change_pct = (price_change / prev["Close"]) * 100

        price_details = {
            "ticker": ticker,
            "price": round(latest["Close"], 2),
            "change": round(price_change, 2),
            "change_percent": round(price_change_pct, 2),
            "open": round(latest["Open"], 2),
            "previous_close": round(prev["Close"], 2),
            "day_high": round(latest["High"], 2),
            "day_low": round(latest["Low"], 2),
            "volume": int(latest["Volume"]),
        }

        rsi_series = self._calculate_rsi(hist["Close"])
        current_rsi = rsi_series.iloc[-1] if not rsi_series.empty else 50

        volatility = hist["Close"].pct_change().std() * 100

        beta = stock.info.get("beta",1.0) if "beta" in stock.info else 1.0

        risk_score = 0
        risk_reasons = []

        if current_rsi > 70:
            risk_score += 2
            risk_reasons.append("RSI indicates Overbought (>70)")
        elif current_rsi < 30:
            risk_score += 2
            risk_reasons.append("RSI indicates Oversold (<30)")

        if beta > 1.5:
            risk_score += 2
            risk_reasons.append("High Beta (>1.5) - Volatile vs Market")

        if volatility > 3:
            risk_score += 2
            risk_reasons.append("High Daily Volatility (>3%)")

        risk_level = "low" if risk_score <= 2 else "Moderate" if risk_score <= 4 else "High"

        avg_volume = hist["Volume"].mean()
        volume_alert = latest["Volume"] > (1.5 * avg_volume)

        return {
            "details": price_details,
            "risk": {
                "score": risk_score,
                "level": risk_level,
                "reasons": risk_reasons,
                "rsi": round(current_rsi, 2),
                "volatility": round(volatility, 2),
                "beta": beta,
            },
            "volume_alert": volume_alert,
        }


dashboard_service = DashboardService()
        
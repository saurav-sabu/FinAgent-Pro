import yfinance as yf
import pandas as pd
from typing import Dict, List, Any
import numpy as np

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

    SECTORS = {
        "Technology": "XLK",
        "Financials": "XLF",
        "Healthcare": "XLV",
        "Energy": "XLE",
        "Consumer": "XLY",
        "Industrial": "XLI"
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

    async def get_dashboard_data(self, ticker: str, timeframe: str = "6M") -> Dict[str, Any]:
        """
        Build the full dashboard payload for a given ticker and timeframe.

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
        sector_data = self._get_sector_performance()

        # Sort all by performance
        sorted_trending = sorted(trending_data, key=lambda x: x["change_percent"], reverse=True)
        
        # Gainers: top 3 positive
        gainers = [x for x in sorted_trending if x["change_percent"] > 0][:3]
        
        # Losers: bottom 3 negative (sorted most negative first)
        losers = sorted([x for x in trending_data if x["change_percent"] < 0], key=lambda x: x["change_percent"])[:3]

        stock_data = self._get_stock_details(ticker, timeframe)

        return {
            "indices": indices_data,
            "trending": {
                "gainers": gainers,
                "losers": losers,
            },
            "sector_performance": sector_data,
            "stock_lookup": stock_data["details"],
            "risk_score": stock_data["risk"],
            "volume_alert": stock_data["volume_alert"],
        }

    def _get_indices_data(self) -> Dict[str, Any]:
        """
        Fetch recent performance (5 trading days) for major indices.
        """
        data: Dict[str, Any] = {}
        for name, symbol in self.INDICES.items():
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d")
                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data[name] = {
                        "name": name,
                        "price": round(float(current_close), 2) if current_close is not None else 0.0,
                        "change_percent": round(float(change_pct), 2) if change_pct is not None else 0.0,
                        "currency": stock.info.get("currency", "USD") if stock.info else "USD"
                    }
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
                
                # We need the stock name, if available
                name = stock.info.get("shortName", symbol) if stock.info else symbol

                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    vol = hist["Volume"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data.append(
                        {
                            "ticker": symbol,
                            "name": name,
                            "price": round(float(current_close), 2) if current_close is not None else 0.0,
                            "change_percent": round(float(change_pct), 2) if change_pct is not None else 0.0,
                            "volume": int(vol) if vol is not None else 0,
                            "currency": stock.info.get("currency", "USD") if stock.info else "USD"
                        }
                    )
            except Exception as e:
                logger.warning(f"Failed to fetch trending ticker {symbol}: {e}")
        return data

    def _get_sector_performance(self) -> Dict[str, float]:
        """
        Fetch recent performance for standard SPDR Sector ETFs to build a heatmap.
        """
        data: Dict[str, float] = {}
        for name, symbol in self.SECTORS.items():
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period="5d")
                if len(hist) >= 2:
                    prev_close = hist["Close"].iloc[-2]
                    current_close = hist["Close"].iloc[-1]
                    change_pct = ((current_close - prev_close) / prev_close) * 100
                    data[name] = round(change_pct, 2)
            except Exception as e:
                logger.warning(f"Failed to fetch sector {name}: {e}")
        return data

    def _get_stock_details(self, ticker: str, timeframe: str = "6M") -> Dict[str, Any]:
        stock = yf.Ticker(ticker)
        
        # Map UI timeframe to yfinance period and interval
        tf_map = {
            "1D": ("1d", "5m"),
            "1W": ("5d", "30m"),
            "1M": ("1mo", "1h"),
            "3M": ("3mo", "1d"),
            "6M": ("6mo", "1d"),
            "1Y": ("1y", "1d"),
            "YTD": ("ytd", "1d"),
            "5Y": ("5y", "1d")
        }
        
        period, interval = tf_map.get(timeframe, ("6mo", "1d"))
        
        # Fetch data based on timeframe
        # We fetch extra for MAs if needed, but for simpler UI we'll stick to the requested range
        # unless it's a daily/weekly view where MAs might not be as common
        hist = stock.history(period=period, interval=interval)

        if hist.empty:
            # Fallback if specific interval fails
            hist = stock.history(period=period)
            if hist.empty:
                raise ValueError(f"{ticker} not found")

        display_hist = hist

        latest = hist.iloc[-1]
        prev = hist.iloc[-2]

        price_change = latest["Close"] - prev["Close"]
        price_change_pct = (price_change / prev["Close"]) * 100

        
        # Indicators
        # Note: Indicators like MA50/MA200 need more history than just the display range.
        # For simplicity in this implementation, we calculate them on whatever data we have.
        # If the timeframe is small (e.g., 1D), these will be mostly NaN.
        ma50 = hist["Close"].rolling(window=min(50, len(hist))).mean()
        ma200 = hist["Close"].rolling(window=min(200, len(hist))).mean()
        rsi_series_full = self._calculate_rsi(hist["Close"])
        
        disp_ma50 = ma50.replace([np.inf, -np.inf, np.nan], None).tolist()
        disp_ma200 = ma200.replace([np.inf, -np.inf, np.nan], None).tolist()
        disp_rsi = rsi_series_full.replace([np.inf, -np.inf, np.nan], None).tolist()
        
        # Format dates as strings
        # For intraday, use HH:mm, for daily use YYYY-MM-DD
        if interval in ["5m", "15m", "30m", "1h"]:
             chart_dates = display_hist.index.strftime('%H:%M').tolist()
        else:
             chart_dates = display_hist.index.strftime('%Y-%m-%d').tolist()

        # Handle earnings date mapping safely
        earnings = None
        if "calendar" in stock.info and stock.info["calendar"]:
            cal = stock.info["calendar"]
            if isinstance(cal, dict) and "Earnings Date" in cal and isinstance(cal["Earnings Date"], list) and len(cal["Earnings Date"]) > 0:
                earnings = cal["Earnings Date"][0].strftime('%Y-%m-%d')

        price_details = {
            "ticker": ticker,
            "name": stock.info.get("longName", ticker),
            "sector": stock.info.get("sector", "N/A"),
            "price": round(float(latest["Close"]), 2) if not pd.isna(latest["Close"]) else 0.0,
            "change": round(float(price_change), 2) if not pd.isna(price_change) else 0.0,
            "change_percent": round(float(price_change_pct), 2) if not pd.isna(price_change_pct) else 0.0,
            "open": round(float(latest["Open"]), 2) if not pd.isna(latest["Open"]) else 0.0,
            "previous_close": round(float(prev["Close"]), 2) if not pd.isna(prev["Close"]) else 0.0,
            "day_high": round(float(latest["High"]), 2) if not pd.isna(latest["High"]) else 0.0,
            "day_low": round(float(latest["Low"]), 2) if not pd.isna(latest["Low"]) else 0.0,
            "volume": int(latest["Volume"]) if not pd.isna(latest["Volume"]) else 0,
            "market_cap": stock.info.get("marketCap", 0),
            "five_two_week_high": round(float(stock.info.get("fiftyTwoWeekHigh", 0)), 2),
            "five_two_week_low": round(float(stock.info.get("fiftyTwoWeekLow", 0)), 2),
            "currency": stock.info.get("currency", "USD"),
            "chart_dates": chart_dates,
            "chart_open": display_hist["Open"].fillna(0).round(2).tolist(),
            "chart_high": display_hist["High"].fillna(0).round(2).tolist(),
            "chart_low": display_hist["Low"].fillna(0).round(2).tolist(),
            "chart_close": display_hist["Close"].fillna(0).round(2).tolist(),
            "chart_volume": display_hist["Volume"].fillna(0).astype(int).tolist(),
            "chart_ma50": [round(float(x), 2) if x is not None else None for x in disp_ma50],
            "chart_ma200": [round(float(x), 2) if x is not None else None for x in disp_ma200],
            "chart_rsi": [round(float(x), 2) if x is not None else None for x in disp_rsi],
            "earnings_date": earnings
        }
        current_rsi = rsi_series_full.iloc[-1] if not rsi_series_full.empty else 50

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
        
import pytest
import pandas as pd
from unittest.mock import patch, MagicMock
from backend.services.dashboard_service import DashboardService

@pytest.fixture
def dashboard_service():
    return DashboardService()

def test_calculate_rsi(dashboard_service):
    """Test RSI calculation with synthetic data."""
    # Create price series that goes up steadily
    prices = pd.Series([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])
    rsi = dashboard_service._calculate_rsi(prices)
    # Steady up-trend should have very high RSI at the end
    assert rsi.iloc[-1] > 80

def test_indices_existence(dashboard_service):
    """Verify all expected indices are in the dictionary."""
    expected = ["S&P 500", "NASDAQ", "Dow Jones"]
    for idx in expected:
        assert idx in dashboard_service.INDICES

@patch("yfinance.Ticker")
def test_get_indices_data_mocked(mock_ticker, dashboard_service):
    """Test individual index fetching with mocked yfinance."""
    mock_instance = MagicMock()
    # Mock history to return at least 2 rows for change calculation
    mock_instance.history.return_value = pd.DataFrame({
        "Close": [100, 105],
        "Volume": [1000, 1100]
    }, index=pd.to_datetime(["2024-03-01", "2024-03-02"]))
    mock_instance.info = {"currency": "USD"}
    mock_ticker.return_value = mock_instance
    
    indices = dashboard_service._get_indices_data()
    assert len(indices) > 0
    for name, data in indices.items():
        assert "price" in data
        assert "change_percent" in data
        assert data["price"] == 105.0

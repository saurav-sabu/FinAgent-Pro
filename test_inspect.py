import requests
import json

try:
    resp = requests.get("http://localhost:8000/dashboard?ticker=AAPL")
    if resp.status_code == 200:
        data = resp.json()
        lookup = data.get("stock_lookup", {})
        print("chart_dates length:", len(lookup.get("chart_dates", [])))
        print("chart_open length:", len(lookup.get("chart_open", [])))
        
        # Check for nulls inside the OHLC arrays
        for k in ["chart_open", "chart_high", "chart_low", "chart_close"]:
            arr = lookup.get(k, [])
            nulls = sum(1 for x in arr if x is None)
            print(f"{k} has {nulls} nulls out of {len(arr)}")
        
        # Check first 5 ma50 and ma200 values
        print("ma50 first 10:", lookup.get("chart_ma50", [])[:10])
        print("ma200 first 10:", lookup.get("chart_ma200", [])[:10])
    else:
        print("Failed:", resp.status_code, resp.text)
except Exception as e:
    print("Error:", e)

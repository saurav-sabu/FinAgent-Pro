import httpx

try:
    r = httpx.post("http://127.0.0.1:8000/auth/register", json={
        "name": "Beta Tester",
        "email": "beta@finagent.com",
        "password": "securepassword123!"
    })
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Exception: {e}")

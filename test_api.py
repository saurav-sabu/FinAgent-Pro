import urllib.request
import json
import sys

data = json.dumps({
    'name': 'Test4', 
    'email': 'curl_test@finagent.com', 
    'password': 'securepassword'
}).encode('utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:8000/auth/register', 
    data=data, 
    headers={'Content-Type': 'application/json'}
)

try:
    urllib.request.urlopen(req)
    print("Success")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code}")
    print(e.read().decode('utf-8'))
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

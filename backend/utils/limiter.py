import time
from collections import defaultdict
from fastapi import HTTPException, Request
from backend.utils.logger import logger

class SimpleRateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)

    async def __call__(self, request: Request, limit: int, window: int):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean up old requests outside the window
        self.requests[client_ip] = [req_time for req_time in self.requests[client_ip] if now - req_time < window]
        
        if len(self.requests[client_ip]) >= limit:
            logger.warning(f"RateLimit Trace: IP {client_ip} exceeded limit ({len(self.requests[client_ip])} >= {limit} in {window}s)")
            raise HTTPException(status_code=429, detail="Too Many Requests")
            
        self.requests[client_ip].append(now)
        logger.debug(f"RateLimit Trace: IP {client_ip} request {len(self.requests[client_ip])}/{limit}")
        return True

_limiter_instance = SimpleRateLimiter()

def rate_limit(limit: int, window: int = 10):
    async def _rate_limit_dependency(request: Request):
        return await _limiter_instance(request, limit, window)
    return _rate_limit_dependency

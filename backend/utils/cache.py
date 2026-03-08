import time
from functools import wraps
from backend.utils.logger import logger

def ttl_cache(ttl_seconds: int = 300):
    """
    A simple thread-safe asynchronous TTL (Time-To-Live) cache decorator.
    Caches the output of an async function based on its arguments.
    """
    cache = {}

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a deterministic hashable key
            # Filter out non-hashable arguments like Request objects
            from starlette.requests import Request
            
            filtered_args = tuple(arg for arg in args if not isinstance(arg, Request))
            filtered_kwargs = {k: v for k, v in kwargs.items() if not isinstance(v, Request)}
            
            key_items = filtered_args + tuple(sorted(filtered_kwargs.items()))
            
            # Use function name + args as cache key
            cache_key = f"{func.__name__}:{hash(key_items)}"

            current_time = time.time()

            # Check if key exists and isn't expired
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if current_time - timestamp < ttl_seconds:
                    logger.debug(f"Cache HIT for {func.__name__} (TTL remaining: {int(ttl_seconds - (current_time - timestamp))}s)")
                    return result
                else:
                    logger.debug(f"Cache EXPIRED for {func.__name__}")

            # Execute the function
            logger.debug(f"Cache MISS for {func.__name__}. Executing...")
            result = await func(*args, **kwargs)

            # Store in cache
            cache[cache_key] = (result, current_time)
            return result

        return wrapper
    return decorator

import os
import redis

_redis_client = None

def get_redis_client():
    global _redis_client
    if _redis_client is None:
        host = os.environ.get("REDIS_HOST", "localhost")
        port = int(os.environ.get("REDIS_PORT", 6379))
        db = int(os.environ.get("REDIS_DB", 0))
        password = os.environ.get("REDIS_PASSWORD", None)
        try:
            _redis_client = redis.StrictRedis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=True
            )
            
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client

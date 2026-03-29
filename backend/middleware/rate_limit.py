import time
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from utils.redis_client import get_redis_client
from django.conf import settings

class RedisRateLimitMiddleware(MiddlewareMixin):
    def process_request(self, request):
        redis = get_redis_client()
        if not redis:
            return
        
        
        user = None
        if hasattr(request, 'user'):
            try:
                if request.user.is_authenticated:
                    user = request.user
            except:
                pass
        
        ip = self.get_ip(request)
        rate = int(settings.RATE_LIMIT_AUTH if user else settings.RATE_LIMIT_ANON)
        key = f"rl:{ip}:{int(time.time() // 60)}"
        count = redis.incr(key)
        redis.expire(key, 60)
        if count > rate:
            retry_after = 60 - (int(time.time()) % 60)
            return JsonResponse({"status": "error", "message": "Rate limit exceeded"}, status=429, headers={"Retry-After": str(retry_after)})

    def get_ip(self, request):
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded:
            ip = x_forwarded.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

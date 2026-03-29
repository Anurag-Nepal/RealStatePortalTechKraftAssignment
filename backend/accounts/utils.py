from django.utils import timezone
from datetime import datetime
from .models import BlacklistedToken
from utils.redis_client import get_redis_client


def set_auth_cookies(response, access_token, refresh_token):
    """Sets HTTP-only access and refresh token cookies."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="Lax",
        secure=False,  
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="Lax",
        secure=False,  
        path="/api/auth/refresh/",
    )

def clear_auth_cookies(response):
    """Expires both auth cookies."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/auth/refresh/")

def blacklist_token(jti, expires_at):
    """Blacklist a JWT: write JTI to Redis and DB."""
    redis_client = get_redis_client()
    if redis_client:
        redis_client.sadd('blacklisted_jti', jti)
    BlacklistedToken.objects.get_or_create(jti=jti, defaults={
        'expires_at': datetime.fromtimestamp(expires_at, tz=timezone.utc)
    })

def is_blacklisted(jti):
    redis_client = get_redis_client()
    if redis_client and redis_client.sismember('blacklisted_jti', jti):
        return True
    return BlacklistedToken.objects.filter(jti=jti).exists()

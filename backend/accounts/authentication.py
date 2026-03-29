from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework.exceptions import AuthenticationFailed
from .models import BlacklistedToken, CustomUser
from .tokens import UUIDAccessToken
from utils.redis_client import get_redis_client

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            
            return None
        try:
            
            validated_token = UUIDAccessToken(raw_token)
        except Exception as e:
            
            
            return None
            
        user_id = validated_token.get('user_id')
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            
            return None
            
        jti = validated_token.get('jti')
        if self.is_token_blacklisted(jti):
            
            return None
            
        return (user, validated_token)

    @staticmethod
    def is_token_blacklisted(jti):
        redis_client = get_redis_client()
        if redis_client and redis_client.sismember('blacklisted_jti', jti):
            return True
        return BlacklistedToken.objects.filter(jti=jti).exists()

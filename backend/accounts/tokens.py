"""
Custom JWT token classes that properly handle UUID primary keys.
Django REST Framework SimpleJWT expects string user IDs, but our CustomUser model uses UUIDs.
"""

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.backends import TokenBackend
import jwt
from django.conf import settings


class UUIDTokenBackend(TokenBackend):
    """
    Custom JWT backend that properly handles UUID values in payloads
    """
    def __init__(self, algorithm='HS256', signing_key=None, verifying_key=None, audience=None, issuer=None, jwk_url=None, leeway=0):
        
        if signing_key is None:
            signing_key = getattr(settings, 'JWT_SECRET_KEY', settings.SECRET_KEY)
        
        super().__init__(algorithm, signing_key, verifying_key, audience, issuer, jwk_url, leeway)
    
    def encode(self, payload):
        """
        Encodes a JWT token payload, ensuring all UUID values are converted to strings
        """
        
        processed_payload = {}
        for key, value in payload.items():
            if hasattr(value, '__str__') and 'uuid' in str(type(value)).lower():
                processed_payload[key] = str(value)
            else:
                processed_payload[key] = value
        
        return jwt.encode(
            payload=processed_payload,
            key=self.signing_key,
            algorithm=self.algorithm,
            headers={'typ': 'JWT', 'alg': self.algorithm}
        )


class UUIDAccessToken(AccessToken):
    """Custom AccessToken that properly handles UUID values in payloads"""
    
    def get_token_backend(self):
        return UUIDTokenBackend(
            algorithm=api_settings.ALGORITHM,
            signing_key=api_settings.SIGNING_KEY,
            audience=api_settings.AUDIENCE,
            issuer=api_settings.ISSUER,
        )
    
    @classmethod  
    def for_user(cls, user):
        """
        Returns an authorization token for the given user.
        """
        token = cls()
        token[api_settings.USER_ID_CLAIM] = str(user.pk)  
        return token


class UUIDRefreshToken(RefreshToken):
    """Custom RefreshToken that properly handles UUID values in payloads"""
    
    access_token_class = UUIDAccessToken
    
    def get_token_backend(self):
        return UUIDTokenBackend(
            algorithm=api_settings.ALGORITHM,
            signing_key=api_settings.SIGNING_KEY,
            audience=api_settings.AUDIENCE,
            issuer=api_settings.ISSUER,
        )
    
    @classmethod
    def for_user(cls, user):
        """
        Returns a refresh token for the given user.
        """
        token = cls()
        token[api_settings.USER_ID_CLAIM] = str(user.pk)  
        return token
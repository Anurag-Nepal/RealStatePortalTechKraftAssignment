from .base import *  
import os

DEBUG = True
ALLOWED_HOSTS = ["*"]

COOKIE_SECURE = False

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]


CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]



EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    EMAIL_BACKEND,
)

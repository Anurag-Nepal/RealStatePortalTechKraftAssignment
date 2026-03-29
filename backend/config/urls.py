from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from utils.redis_client import get_redis_client
import time
import os

def health_check(request):
    """
    Comprehensive health check endpoint that verifies:
    - Database connectivity and performance
    - Redis connectivity and performance
    - Application status and version
    - Dependencies
    """
    
    health_data = {
        "status": "ok",
        "timestamp": int(time.time()),
        "version": getattr(settings, 'APP_VERSION', '1.0.0'),
        "environment": getattr(settings, 'ENVIRONMENT', 'development'),
        "checks": {
            "database": {"status": "ok", "message": "Database is healthy"},
            "redis": {"status": "ok", "message": "Redis is healthy"},
            "cache": {"status": "ok", "message": "Cache is healthy"},
        },
        "details": {}
    }
    
    overall_status = True
    
    
    try:
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        db_response_time = (time.time() - start_time) * 1000  
        
        
        if db_response_time > 100:
            health_data["checks"]["database"]["status"] = "warning"
            health_data["checks"]["database"]["message"] = f"Database response slow: {db_response_time:.2f}ms"
        
        health_data["details"]["database"] = {
            "response_time_ms": round(db_response_time, 2),
            "connection_status": "connected"
        }
        
    except Exception as e:
        overall_status = False
        health_data["checks"]["database"]["status"] = "fail"
        health_data["checks"]["database"]["message"] = f"Database connection failed: {str(e)}"
        health_data["details"]["database"] = {
            "error": str(e),
            "connection_status": "disconnected"
        }

    
    try:
        redis_client = get_redis_client()
        start_time = time.time()
        
        
        ping_result = redis_client.ping()
        
        
        test_key = "health_check_test"
        test_value = "test_value"
        redis_client.set(test_key, test_value, ex=10)  
        retrieved_value = redis_client.get(test_key)
        redis_client.delete(test_key)
        
        redis_response_time = (time.time() - start_time) * 1000
        
        if retrieved_value.decode('utf-8') != test_value:
            raise Exception("Redis set/get operation failed")
            
        if redis_response_time > 50:
            health_data["checks"]["redis"]["status"] = "warning" 
            health_data["checks"]["redis"]["message"] = f"Redis response slow: {redis_response_time:.2f}ms"
            
        health_data["details"]["redis"] = {
            "response_time_ms": round(redis_response_time, 2),
            "ping_result": ping_result,
            "connection_status": "connected",
            "test_operations": "passed"
        }
        
    except Exception as e:
        overall_status = False
        health_data["checks"]["redis"]["status"] = "fail"
        health_data["checks"]["redis"]["message"] = f"Redis connection failed: {str(e)}"
        health_data["details"]["redis"] = {
            "error": str(e),
            "connection_status": "disconnected"
        }

    
    try:
        start_time = time.time()
        cache_test_key = "health_check_cache_test"
        cache_test_value = "cache_test_value"
        
        cache.set(cache_test_key, cache_test_value, timeout=10)
        retrieved_cache_value = cache.get(cache_test_key)
        cache.delete(cache_test_key)
        
        cache_response_time = (time.time() - start_time) * 1000
        
        if retrieved_cache_value != cache_test_value:
            raise Exception("Cache set/get operation failed")
            
        health_data["details"]["cache"] = {
            "response_time_ms": round(cache_response_time, 2),
            "backend": getattr(settings, 'CACHES', {}).get('default', {}).get('BACKEND', 'unknown'),
            "test_operations": "passed"
        }
        
    except Exception as e:
        overall_status = False
        health_data["checks"]["cache"]["status"] = "fail"
        health_data["checks"]["cache"]["message"] = f"Cache failed: {str(e)}"
        health_data["details"]["cache"] = {
            "error": str(e)
        }

    
    if settings.DEBUG:
        health_data["details"]["system"] = {
            "python_version": os.sys.version,
            "django_version": getattr(settings, 'DJANGO_VERSION', 'unknown'),
            "debug_mode": settings.DEBUG,
            "allowed_hosts": settings.ALLOWED_HOSTS
        }

    
    failed_checks = [check for check in health_data["checks"].values() if check["status"] == "fail"]
    warning_checks = [check for check in health_data["checks"].values() if check["status"] == "warning"]
    
    if failed_checks:
        health_data["status"] = "fail"
        status_code = 503
    elif warning_checks:
        health_data["status"] = "warning"  
        status_code = 200
    else:
        health_data["status"] = "ok"
        status_code = 200

    
    health_data["summary"] = {
        "total_checks": len(health_data["checks"]),
        "passing": len([c for c in health_data["checks"].values() if c["status"] == "ok"]),
        "warnings": len(warning_checks),
        "failing": len(failed_checks)
    }

    return JsonResponse(health_data, status=status_code)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('properties.urls')),
    path('api/health/', health_check, name='health-check'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
]

from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, FavouriteViewSet, ViewingRequestViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'favourites', FavouriteViewSet, basename='favourite')
router.register(r'viewings', ViewingRequestViewSet, basename='viewing')

urlpatterns = router.urls

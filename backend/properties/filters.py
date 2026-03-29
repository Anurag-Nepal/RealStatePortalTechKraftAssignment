import django_filters
from .models import Property

class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    min_bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr='gte')
    city = django_filters.CharFilter(field_name="city", lookup_expr='icontains')
    state = django_filters.CharFilter(field_name="state", lookup_expr='icontains')
    property_type = django_filters.CharFilter(field_name="property_type", lookup_expr='iexact')
    is_available = django_filters.BooleanFilter(field_name="is_available")
    ordering = django_filters.OrderingFilter(
        fields=(
            ("price", "price"),
            ("created_at", "created_at"),
            ("bedrooms", "bedrooms"),
        ),
    )

    class Meta:
        model = Property
        fields = [
            "city",
            "state",
            "property_type",
            "min_price",
            "max_price",
            "min_bedrooms",
            "is_available",
            "ordering",
        ]

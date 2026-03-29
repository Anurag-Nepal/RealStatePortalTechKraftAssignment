from rest_framework import serializers
from django.utils import timezone
from .models import Property, Favourite, ViewingRequest

class PropertySerializer(serializers.ModelSerializer):
    is_favourited = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'address', 'city', 'state', 'zip_code', 'price',
            'bedrooms', 'bathrooms', 'sqft', 'property_type', 'description',
            'image_url', 'image_gallery', 'is_available', 'created_at', 'updated_at', 'is_favourited'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_favourited']

    def get_is_favourited(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return False
        user = request.user
        if not user or not user.is_authenticated:
            return False
        
        if hasattr(obj, 'is_favourited'):
            return obj.is_favourited
        return Favourite.objects.filter(user=user, property=obj).exists()

class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'title', 'address', 'city', 'state', 'zip_code', 'price',
            'bedrooms', 'bathrooms', 'sqft', 'property_type', 'description',
            'image_url', 'image_gallery', 'is_available'
        ]

class FavouriteSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    class Meta:
        model = Favourite
        fields = ['id', 'property', 'created_at']
        read_only_fields = ['id', 'property', 'created_at']


class ViewingRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = ViewingRequest
        fields = [
            'id',
            'property',
            'scheduled_datetime',
            'status',
            'notes',
            'created_at',
            'user_email',
            'user_name',
            'property_title',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'property', 'user_email', 'user_name', 'property_title']

    def validate_scheduled_datetime(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Scheduled time must be in the future.')
        return value

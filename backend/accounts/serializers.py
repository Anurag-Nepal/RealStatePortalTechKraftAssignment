from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from .models import CustomUser, EmailOTP


def generate_otp_code() -> str:
    import random

    return f"{random.randint(0, 999999):06d}"

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password', 'password_confirm', 'role']
        extra_kwargs = {'role': {'read_only': True}}

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already in use."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
        )

        code = generate_otp_code()
        expires_at = timezone.now() + timedelta(minutes=15)
        EmailOTP.objects.create(user=user, code=code, expires_at=expires_at)

        self._otp_code = code
        self._otp_expires_at = expires_at

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        now = timezone.now()
        otp_obj = (
            EmailOTP.objects.filter(user=user, code=otp, is_used=False, expires_at__gte=now)
            .order_by('-created_at')
            .first()
        )

        if not otp_obj:
            
            from django.core.cache import cache

            cache_key = f"otp_attempts:{email}"
            attempts = cache.get(cache_key, 0) + 1
            cache.set(cache_key, attempts, getattr(settings, 'OTP_ATTEMPT_WINDOW_SECONDS', 900))

            max_attempts = getattr(settings, 'OTP_MAX_ATTEMPTS', 5)
            if attempts >= max_attempts:
                raise serializers.ValidationError({'otp': 'Too many failed attempts. Please request a new code.'})

            raise serializers.ValidationError({'otp': 'Invalid or expired OTP.'})

        attrs['user'] = user
        attrs['otp_obj'] = otp_obj
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        otp_obj = self.validated_data['otp_obj']

        user.is_active = True
        user.save(update_fields=['is_active'])

        otp_obj.is_used = True
        otp_obj.save(update_fields=['is_used'])

        
        from django.core.cache import cache

        cache_key = f"otp_attempts:{user.email}"
        cache.delete(cache_key)

        return user


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})

        if user.is_active:
            raise serializers.ValidationError({'email': 'This account is already verified.'})

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']

        
        EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        code = generate_otp_code()
        expires_at = timezone.now() + timedelta(minutes=15)
        EmailOTP.objects.create(user=user, code=code, expires_at=expires_at)

        self._otp_code = code
        self._otp_expires_at = expires_at

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(
            request=self.context.get('request'),
            username=data['email'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('User is inactive')
        data['user'] = user
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role', 'created_at']
        read_only_fields = fields

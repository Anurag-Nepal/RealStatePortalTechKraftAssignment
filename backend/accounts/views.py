from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .tokens import UUIDRefreshToken
from .models import CustomUser
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
)
from .utils import set_auth_cookies, clear_auth_cookies, blacklist_token
from rest_framework.exceptions import AuthenticationFailed

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp_code = getattr(serializer, '_otp_code', None)
        otp_expires_at = getattr(serializer, '_otp_expires_at', None)

        if otp_code:
            subject = 'Verify your email for RealStatePortal'
            message = (
                f"Hi {user.name},\n\n"
                f"Your verification code is: {otp_code}.\n"
                f"It expires at {otp_expires_at}.\n\n"
                "If you did not sign up, you can ignore this email."
            )
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

        return Response(
            {
                'detail': 'Registration successful. Please verify your email with the OTP sent.',
                'email': user.email,
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = UUIDRefreshToken.for_user(user)
        response = Response({'user': UserSerializer(user).data})
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]  
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(status=status.HTTP_204_NO_CONTENT)
        try:
            token = UUIDRefreshToken(refresh_token)
            blacklist_token(token['jti'], token['exp'])
        except Exception:
            pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_auth_cookies(response)
        return response

class RefreshView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            raise AuthenticationFailed('No refresh token')
        try:
            token = UUIDRefreshToken(refresh_token)
        except Exception:
            raise AuthenticationFailed('Invalid refresh token')
        from .utils import is_blacklisted
        if is_blacklisted(token['jti']):
            raise AuthenticationFailed('Refresh token blacklisted')
        user = CustomUser.objects.get(id=token['user_id'])
        new_refresh = UUIDRefreshToken.for_user(user)
        response = Response({'refreshed': True})
        set_auth_cookies(response, str(new_refresh.access_token), str(new_refresh))
        blacklist_token(token['jti'], token['exp'])
        return response

class MeView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = UUIDRefreshToken.for_user(user)
        response = Response({'user': UserSerializer(user).data})
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp_code = getattr(serializer, '_otp_code', None)
        otp_expires_at = getattr(serializer, '_otp_expires_at', None)

        if otp_code:
            subject = 'Your new verification code for RealStatePortal'
            message = (
                f"Hi {user.name},\n\n"
                f"Your new verification code is: {otp_code}.\n"
                f"It expires at {otp_expires_at}.\n\n"
                "If you did not request this, you can ignore this email."
            )
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

        return Response({'detail': 'A new OTP has been sent if the account exists and is not verified.'})

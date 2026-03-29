from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.db.models import Exists, OuterRef
from django.core.mail import send_mail
from django.conf import settings
from .models import Property, Favourite, ViewingRequest
from .serializers import (
    PropertySerializer,
    PropertyCreateSerializer,
    FavouriteSerializer,
    ViewingRequestSerializer,
)
from .filters import PropertyFilter
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('-created_at')
    filterset_class = PropertyFilter
    
    def get_permissions(self):
        """
        Allow anyone to list/retrieve properties.
        Only admins can create/update/delete.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateSerializer
        return PropertySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            qs = qs.annotate(
                is_favourited=Exists(Favourite.objects.filter(user=user, property=OuterRef('pk')))
            )
        return qs

class FavouriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavouriteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return Favourite.objects.filter(user=self.request.user).select_related('property')

    def create(self, request, *args, **kwargs):
        prop_id = request.data.get('property_id')
        if Favourite.objects.filter(user=request.user, property_id=prop_id).exists():
            return Response({'status': 'error', 'message': 'Already favourited'}, status=409)
        fav = Favourite.objects.create(user=request.user, property_id=prop_id)
        serializer = self.get_serializer(fav)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ViewingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ViewingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            qs = ViewingRequest.objects.all().select_related('property', 'user')
        else:
            qs = ViewingRequest.objects.filter(user=user).select_related('property', 'user')

        property_id = self.request.query_params.get('property_id')
        if property_id:
            qs = qs.filter(property_id=property_id)

        status_param = self.request.query_params.get('status')
        if status_param in {'pending', 'confirmed', 'cancelled'}:
            qs = qs.filter(status=status_param)

        return qs

    def create(self, request, *args, **kwargs):
        property_id = request.data.get('property_id')
        try:
            prop = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response({'detail': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        viewing = ViewingRequest.objects.create(
            user=request.user,
            property=prop,
            scheduled_datetime=serializer.validated_data['scheduled_datetime'],
            notes=serializer.validated_data.get('notes', ''),
        )

        subject = 'Viewing request confirmation'
        message_lines = [
            f"Hi {request.user.name},",
            "",
            f"Your viewing request for '{prop.title}' has been received.",
            f"Scheduled time: {viewing.scheduled_datetime}",
            f"Property address: {prop.address}, {prop.city}, {prop.state} {prop.zip_code}",
            "",
            f"Reference ID: {viewing.id}",
            "",
            "We will contact you if any changes are required.",
        ]
        if viewing.notes:
            message_lines.extend(["", f"Your note: {viewing.notes}"])

        message = "\n".join(message_lines)

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [request.user.email],
                fail_silently=True,
            )

            admin_email = getattr(settings, 'VIEWING_REQUEST_ADMIN_EMAIL', '')
            if admin_email:
                send_mail(
                    f"New viewing request: {prop.title}",
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [admin_email],
                    fail_silently=True,
                )
        except Exception:
            pass

        output_serializer = self.get_serializer(viewing)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirm(self, request, pk=None):
        viewing = self.get_object()

        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admin can confirm viewings.'}, status=status.HTTP_403_FORBIDDEN)

        if viewing.status == 'confirmed':
            return Response({'detail': 'Viewing is already confirmed.'}, status=status.HTTP_200_OK)

        viewing.status = 'confirmed'
        viewing.save(update_fields=['status'])

        subject = 'Your property viewing is confirmed'
        message_lines = [
            f"Hi {viewing.user.name},",
            "",
            f"Your viewing request for '{viewing.property.title}' has been confirmed.",
            f"Scheduled time: {viewing.scheduled_datetime}",
            f"Property address: {viewing.property.address}, {viewing.property.city}, {viewing.property.state} {viewing.property.zip_code}",
            "",
            f"Reference ID: {viewing.id}",
        ]
        message = "\n".join(message_lines)

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [viewing.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        serializer = self.get_serializer(viewing)
        return Response(serializer.data, status=status.HTTP_200_OK)

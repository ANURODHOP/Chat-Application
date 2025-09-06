from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import obtain_auth_token  # Optional: Include if you want login here too

from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.db import models
from .models import Message
from .serializers import MessageSerializer  # Assuming you have this from earlier

import uuid

# Function-based view for user registration
@api_view(['POST'])
@permission_classes([])  # AllowAny implied, but explicit for clarity
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)
    return Response({'token': token.key})

# Class-based view for listing and creating messages
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        receiver_id = self.request.query_params.get('receiver')
        if receiver_id:
            return Message.objects.filter(
                (models.Q(sender=user) & models.Q(receiver_id=receiver_id)) |
                (models.Q(receiver=user) & models.Q(sender_id=receiver_id))
            ).order_by('timestamp')
        return Message.objects.none()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

# Class-based view for photo uploads
class UploadPhotoView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'photo' not in request.FILES:
            return Response({"error": "No photo provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        photo = request.FILES['photo']
        
        # Basic validation: Check file type and size
        if not photo.content_type.startswith('image/'):
            return Response({"error": "File must be an image"}, status=status.HTTP_400_BAD_REQUEST)
        if photo.size > 5 * 1024 * 1024:  # 5MB limit
            return Response({"error": "File too large"}, status=status.HTTP_400_BAD_REQUEST)
        
        message_id = request.data.get('message_id')
        
        # Generate unique filename to avoid conflicts
        ext = photo.name.split('.')[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        file_path = default_storage.save(f'photos/{unique_name}', photo)
        file_url = default_storage.url(file_path)
        
        # Check if message_id is provided
        if message_id:
            try:
                message = Message.objects.get(id=message_id, sender=request.user)  # Ensure ownership
                message.photo = file_path  # Save the relative path to ImageField
                message.save()
            except Message.DoesNotExist:
                return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'url': file_url})
    
# Function-based view for listing users (excluding the current user)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    users = User.objects.exclude(id=request.user.id)
    user_data = [{'id': user.id, 'username': user.username} for user in users]
    return Response(user_data)


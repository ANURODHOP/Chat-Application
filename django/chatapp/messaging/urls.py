from rest_framework.authtoken.views import obtain_auth_token
from django.urls import path
from .views import MessageListCreateView, UploadPhotoView, register, user_list

urlpatterns = [
    path('messages/', MessageListCreateView.as_view(), name='messages'),
    path('register/', register),
    path('upload-photo/', UploadPhotoView.as_view()),
    path('login/', obtain_auth_token, name='api_token_auth'),  # Token-based authentication
    path('users/', user_list, name='user-list'),  # Endpoint to list users
]
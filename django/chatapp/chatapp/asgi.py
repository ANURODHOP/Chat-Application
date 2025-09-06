import os

from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter, URLRouter

from channels.auth import AuthMiddlewareStack

from messaging.routing import websocket_urlpatterns
from messaging.middleware import TokenAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chatapp.settings")


application = ProtocolTypeRouter({ 
    "http": get_asgi_application(),
    "websocket": 
        TokenAuthMiddleware(  
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
        )
})
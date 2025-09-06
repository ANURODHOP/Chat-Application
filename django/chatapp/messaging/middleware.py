# middleware.py
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser

@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Parse query string for token
        query_string = parse_qs(scope['query_string'].decode())
        token_key = query_string.get('token')

        if token_key:
            user = await get_user(token_key[0])  # Get user async
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()

        # Call the next middleware/app async
        return await self.inner(scope, receive, send)

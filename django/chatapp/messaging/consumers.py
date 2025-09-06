import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or user.is_anonymous or not user.id:
            print("Rejecting invalid or anonymous user")
            await self.close()
            return

        self.group_name = f'chat_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"User {user.username} connected to group {self.group_name}")

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name') and self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        print(f"Received raw data: {text_data}")  # Debug log
        data = {}
        if text_data:
            try:
                data = json.loads(text_data)
                print(f"Parsed data: {data}")  # Debug log
            except Exception as e:
                print(f"JSON parse error: {e}")  # Debug log
                await self.send(text_data=json.dumps({"error": "Invalid JSON"}))
                return

        message = data.get('message', '')  # Default to empty string
        receiver_id = data.get('receiver_id')
        photo = data.get('photo')

        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.send(text_data=json.dumps({"error": "User not authenticated"}))
            return

        # ✅ Fixed: Allow photo-only messages (empty message but with photo)
        if not receiver_id or (not message and not photo):
            await self.send(text_data=json.dumps({"error": "Missing receiver_id or content (message/photo)"}))
            return

        try:
            saved_message = await self.save_message(user.id, receiver_id, message, photo)
            print(f"✅ Saved message from {user.username} to {receiver_id}")
            print(f"📝 Content: '{saved_message.content}', Photo: '{saved_message.photo.name if saved_message.photo else None}'")

            # ✅ Fixed: Proper photo URL handling
            photo_url = None
            if saved_message.photo:
                try:
                    photo_url = saved_message.photo.url
                    print(f"🖼️ Photo URL: {photo_url}")
                except Exception as e:
                    print(f"❌ Error getting photo URL: {e}")

            # Prepare the event data
            event = {
                'type': 'chat_message',
                'message': saved_message.content,
                'photo': photo_url,
                'sender': user.username,
                'timestamp': str(saved_message.timestamp),
            }

            # Broadcast to receiver's group
            await self.channel_layer.group_send(
                f"chat_{receiver_id}",
                event
            )
            print(f"📤 Sent message to receiver group chat_{receiver_id}")

            # Also broadcast to sender's group (so sender sees their own message)
            await self.channel_layer.group_send(
                f"chat_{user.id}",
                event
            )
            print(f"📤 Sent message to sender group chat_{user.id}")

            # Send notification if not read (to receiver only)
            if not saved_message.is_read:
                await self.channel_layer.group_send(
                    f"chat_{receiver_id}",
                    {'type': 'notification', 'message': f"New message from {user.username}"}
                )
                print(f"🔔 Sent notification to group chat_{receiver_id}")

        except Exception as e:
            print(f"❌ Error in receive: {e}")
            import traceback
            traceback.print_exc()  # Print full stack trace for debugging
            await self.send(text_data=json.dumps({"error": "Failed to process message"}))

    async def chat_message(self, event):
        print(f"📨 Sending chat message to client: {event}")
        await self.send(text_data=json.dumps(event))

    async def notification(self, event):
        print(f"🔔 Sending notification to client: {event}")
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content, photo):
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist as e:
            print(f"❌ User lookup error: {e}")
            raise

        print(f"💾 Creating message: sender={sender.username}, receiver={receiver.username}, content='{content}', photo='{photo}'")

        # ✅ Fixed: Create message with proper content handling
        msg = Message.objects.create(
            sender=sender, 
            receiver=receiver, 
            content=content or ''  # Allow empty content for photo-only messages
        )

        # ✅ Fixed: Proper photo field assignment for ImageField
        if photo:
            try:
                # For Django ImageField, set the name attribute directly
                # This assumes the photo path is relative to MEDIA_ROOT
                msg.photo.name = photo
                msg.save()
                print(f"✅ Photo saved: {msg.photo.name}")
                print(f"🔗 Photo URL: {msg.photo.url}")
            except Exception as e:
                print(f"❌ Error saving photo: {e}")
                # Continue without photo rather than failing entirely
                pass

        return msg

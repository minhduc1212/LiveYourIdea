from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict, List, Set
import json
import uvicorn
import os
import uuid

app = FastAPI(title="LiveYourIdea", description="Collaborative Live Notepad")

# CORS for development (React dev server on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class User:
    def __init__(self, username: str, websocket: WebSocket, color: str):
        self.username = username
        self.websocket = websocket
        self.color = color
        self.user_id = str(uuid.uuid4())[:8]


class Room:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.users: Dict[str, User] = {}  # user_id -> User
        self.document_content: str = ""  # Store current document as HTML

    def get_user_list(self) -> list:
        return [
            {"user_id": u.user_id, "username": u.username, "color": u.color}
            for u in self.users.values()
        ]


class RoomManager:
    # Predefined colors for user avatars
    COLORS = [
        "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
        "#ec4899", "#f43f5e", "#ef4444", "#f97316",
        "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
        "#3b82f6", "#2563eb", "#7c3aed", "#c026d3",
    ]

    def __init__(self):
        self.rooms: Dict[str, Room] = {}
        self.color_index = 0

    def get_or_create_room(self, room_id: str) -> Room:
        if room_id not in self.rooms:
            self.rooms[room_id] = Room(room_id)
        return self.rooms[room_id]

    def get_next_color(self) -> str:
        color = self.COLORS[self.color_index % len(self.COLORS)]
        self.color_index += 1
        return color

    async def connect(self, room_id: str, username: str, websocket: WebSocket) -> User:
        await websocket.accept()
        room = self.get_or_create_room(room_id)
        color = self.get_next_color()
        user = User(username=username, websocket=websocket, color=color)
        room.users[user.user_id] = user

        # Send full document sync to the new user
        await websocket.send_text(json.dumps({
            "type": "full_sync",
            "content": room.document_content,
            "user_id": user.user_id,
        }))

        # Broadcast user join to all others in the room
        await self.broadcast(room_id, {
            "type": "user_join",
            "user": {"user_id": user.user_id, "username": username, "color": color},
        }, exclude_user_id=user.user_id)

        # Send the full user list to everyone in the room
        await self.broadcast(room_id, {
            "type": "user_list",
            "users": room.get_user_list(),
        })

        return user

    async def disconnect(self, room_id: str, user: User):
        room = self.rooms.get(room_id)
        if room and user.user_id in room.users:
            del room.users[user.user_id]

            # Broadcast user leave
            await self.broadcast(room_id, {
                "type": "user_leave",
                "user_id": user.user_id,
                "username": user.username,
            })

            # Send updated user list
            await self.broadcast(room_id, {
                "type": "user_list",
                "users": room.get_user_list(),
            })

            # Clean up empty rooms
            if not room.users:
                del self.rooms[room_id]

    async def broadcast(self, room_id: str, message: dict, exclude_user_id: str = None):
        room = self.rooms.get(room_id)
        if not room:
            return
        msg_text = json.dumps(message)
        disconnected = []
        for uid, user in room.users.items():
            if uid != exclude_user_id:
                try:
                    await user.websocket.send_text(msg_text)
                except Exception:
                    disconnected.append(uid)
        # Clean up any broken connections
        for uid in disconnected:
            if uid in room.users:
                del room.users[uid]


manager = RoomManager()


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, username: str = "Anonymous"):
    user = await manager.connect(room_id, username, websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "delta":
                # Quill delta operation — broadcast to others
                await manager.broadcast(room_id, {
                    "type": "delta",
                    "delta": data.get("delta"),
                    "user_id": user.user_id,
                }, exclude_user_id=user.user_id)

            elif msg_type == "content_update":
                # Full HTML content update — store on server for new user sync
                room = manager.rooms.get(room_id)
                if room:
                    room.document_content = data.get("content", "")

    except WebSocketDisconnect:
        await manager.disconnect(room_id, user)
    except Exception as e:
        print(f"Error in WebSocket for user {user.username}: {e}")
        await manager.disconnect(room_id, user)


# Serve React build in production
frontend_build = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.isdir(frontend_build):
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
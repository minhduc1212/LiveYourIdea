from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import uvicorn

app = FastAPI()

# 1. Initialize Connection Manager
class ConnectionManager:
    def __init__(self):
        # List to store all connected clients (users)
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # Accept connection request from client
        await websocket.accept()
        # Add client to active list
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Remove client from list when they close tab/lose connection
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str, sender: WebSocket):
        # Loop through all online clients
        for connection in self.active_connections:
            # Send new text to EVERYONE, EXCEPT the sender
            # Reason: The sender's client already displays what they typed; resending causes duplication/lag
            if connection != sender:
                await connection.send_text(message)

# Create an instance of the manager
manager = ConnectionManager()


# 2. Create WebSocket endpoint (Instead of @app.get or @app.post)
@app.websocket("/ws/notepad")
async def websocket_endpoint(websocket: WebSocket):
    # When a client connects to url ws://domain/ws/notepad
    await manager.connect(websocket)
    
    try:
        # Use an infinite loop to keep connection open and listen continuously
        while True:
            # Wait for client to type and send text (FastAPI pauses here without blocking server thanks to await)
            data = await websocket.receive_text()
            
            # As soon as text is received, broadcast to all other clients
            await manager.broadcast(data, sender=websocket)
            
    except WebSocketDisconnect:
        # Handle sudden client disconnection
        manager.disconnect(websocket)
        print("A user has left the notepad.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
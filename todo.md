# Idea
  [X] share idea -> live write in notepad with a group of people
  [X] no login, just enter a name and a room code to join
  [X] real-time collaboration with live updates
  [X] canvas to image, video, draw, etc
  [ ] live talking
  [ ] the room master can kick, ban, and manage users in the room
  [ ] support for multiple rooms and private rooms with password protection
  [ ] export the notepad content as a text file or PDF
  [ ] mobile-friendly design for on-the-go collaboration
  [ ] watch the notepad content in real-time without editing permissions (read-only mode)
  [ ] support for rich text formatting (bold, italic, underline, etc.) and images
  [ ] show the list of connected users and their activity status (typing, idle, etc.)
  [ ] free to drag and drop, put text, image, .. anywhere on the canvas, not just a big textarea
  [ ] support for multiple pages or sections within the same room
  [ ] integration with third-party services like Google Drive or Dropbox for easy file sharing and storage
# Tech
 - use webRTC to share the notepad content
 - backend: websocket server to manage the connections and rooms: FastAPI + WebSockets
 - frontend: a big textarea to write, and a list of connected users: React.js + WebSocket client + Tailwind CSS + tldraw 
 - deploy on a simple hosting service: Vercel 

# UI
 - modern and minimalistic, bright colors, art, simple and intuitive design, like a newspaper
 - responsive layout for both desktop and mobile devices
 - show the list of connected users on the side
 - show the number of users currently online
 - topbar to change font, color, and other formatting options
 - detail control for the text formatting, like font size, color, bold, italic, underline, etc. but still keep the design

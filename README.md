# LiveYourIdea

A real-time, collaborative creative space designed for distraction-free writing. LiveYourIdea lets multiple people jump into a shared room and craft ideas together instantly, with a focus on an ultra-minimalist, literary aesthetic.

## Features

*   **Real-Time Collaboration**: Write together instantly. Changes are synced across all connected clients with minimal latency using WebSockets.
*   **Room-Based Isolation**: Create a unique room code or let the app generate one for you. Only people with the code can see and edit the document.
*   **Literary Aesthetic**: A carefully designed, distraction-free user interface. It features a neutral color palette, classic serif typography (`Playfair Display` and `Lora`), and maximum whitespace to keep the focus entirely on your words.
*   **Rich Text Editing**: Powered by Quill.js. Format your text with bold, italics, underlines, blockquotes, and even insert images via a custom, text-based toolbar that fits seamlessly into the minimalist design.
*   **Live User Tracking**: See exactly who is in the room with you. Participants are elegantly listed at the top of the document.
*   **No Login Required**: Just pick a name, enter a room code, and start writing.

## Tech Stack

*   **Backend**: Python, FastAPI, WebSockets
*   **Frontend**: React (Vite), Tailwind CSS v4, react-quill-new

## Getting Started

### Prerequisites

*   Python 3.8+
*   Node.js 18+

### Backend Setup

1.  Navigate to the project root:
    ```bash
    cd LiveYourIdea
    ```
2.  Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server:
    ```bash
    python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
    ```
    The WebSocket server will be running on `ws://127.0.0.1:8000`.

### Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd LiveYourIdea/frontend
    ```
2.  Install the Node.js dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

### Production Build

To serve the application entirely from the FastAPI backend:

1.  Build the frontend:
    ```bash
    cd LiveYourIdea/frontend
    npm run build
    ```
2.  Start the backend server. It is configured to automatically serve the static files from the `frontend/dist` directory on the root path `/`:
    ```bash
    cd LiveYourIdea
    python -m uvicorn app:app --host 0.0.0.0 --port 8000
    ```
3.  Open `http://localhost:8000` in your browser.

import { useState, useCallback, useRef } from 'react';
import JoinRoom from './components/JoinRoom';
import Editor from './components/Editor';
import CustomToolbar from './components/CustomToolbar';
import { useWebSocket } from './hooks/useWebSocket';

/**
 * Format user list into a literary participant string.
 * "Cùng chắp bút: A. Anonymous, M. Đức"
 */
function formatParticipants(users) {
  if (!users || users.length === 0) return '';
  const names = users.map((u) => {
    const initial = u.username.charAt(0).toUpperCase();
    return `${initial}. ${u.username}`;
  });
  return `Co-written by: ${names.join(', ')}`;
}

export default function App() {
  const [view, setView] = useState('join');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');

  const editorMessageHandler = useRef(null);
  const quillRef = useRef(null);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'full_sync':
        setUserId(data.user_id);
        editorMessageHandler.current?.(data);
        break;
      case 'user_list':
        setUsers(data.users || []);
        break;
      case 'delta':
        editorMessageHandler.current?.(data);
        break;
      default:
        break;
    }
  }, []);

  const { status, send, disconnect } = useWebSocket(
    view === 'editor' ? roomId : null,
    username,
    handleMessage,
  );

  const handleJoin = (name, room) => {
    setUsername(name);
    setRoomId(room);
    setView('editor');
  };

  const handleLeave = () => {
    disconnect();
    setView('join');
    setUsers([]);
    setUserId('');
    setRoomId('');
  };

  const handleCopyRoom = () => {
    navigator.clipboard?.writeText(roomId);
  };

  if (view === 'join') {
    return <JoinRoom onJoin={handleJoin} />;
  }

  const participantText = formatParticipants(users);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ───── HEADER ───── */}
      <header className="app-header">
        {/* Left: Room info */}
        <div className="header-section">
          <div className="header-room">
            <span>ROOM:</span>
            {roomId.toUpperCase()}
            <button
              id="btn-copy-room"
              onClick={handleCopyRoom}
              title="Copy room code"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '8px',
                padding: '2px',
                display: 'inline-flex',
                verticalAlign: 'middle',
              }}
            >
              <svg
                width="12" height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#aaa"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="0" />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Custom text-based toolbar */}
        <CustomToolbar quillRef={quillRef} />

        {/* Right: Status + Exit */}
        <div className="header-section">
          <div className="header-status">
            <span className={`header-status-dot ${status !== 'connected' ? 'header-status-dot--offline' : ''}`} />
            {status === 'connected' ? 'ONLINE' : status === 'connecting' ? 'CONNECTING...' : 'OFFLINE'}
          </div>
          <button id="btn-leave-room" className="btn-exit" onClick={handleLeave}>
            EXIT
          </button>
        </div>
      </header>

      {/* ───── EDITOR AREA ───── */}
      <div className="editor-wrapper animate-fade">
        <div className="editor-container">
          {/* Document title (room name displayed as literary heading) */}
          <h1 className="editor-title">
            {roomId}
          </h1>

          {/* Participants line */}
          {participantText && (
            <p className="editor-participants">{participantText}</p>
          )}

          {/* Thin divider */}
          <div className="editor-divider" />

          {/* Quill Editor */}
          <Editor
            send={send}
            onMessage={editorMessageHandler}
            quillRef={quillRef}
          />
        </div>
      </div>
    </div>
  );
}

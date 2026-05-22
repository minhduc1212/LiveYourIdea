import { useState } from 'react';

const ADJECTIVES = ['Swift', 'Bright', 'Cool', 'Bold', 'Vivid', 'Calm', 'Pure', 'Keen'];
const NOUNS = ['Idea', 'Mind', 'Flow', 'Wave', 'Spark', 'Note', 'Beam', 'Star'];

function generateRoomId() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${adj}${noun}${num}`;
}

export default function JoinRoom({ onJoin }) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const name = username.trim() || 'Anonymous';
    const room = roomId.trim() || generateRoomId();
    onJoin(name, room);
  };

  const handleCreate = () => {
    const name = username.trim() || 'Anonymous';
    const room = generateRoomId();
    setRoomId(room);
    onJoin(name, room);
  };

  return (
    <div className="join-page">
      <div className="join-card animate-fade">

        <h1 className="join-title">Space<br />To Create</h1>
        <p className="join-subtitle">Write together, in real-time.</p>

        <form onSubmit={handleJoin}>
          {/* Username field */}
          <div className="join-field">
            <label className="join-label" htmlFor="input-username">Name</label>
            <div className="join-input-wrapper">
              {/* User icon — thin line-art */}
              <svg className="join-input-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              <input
                id="input-username"
                type="text"
                className="join-input"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                maxLength={30}
              />
            </div>
          </div>

          {/* Room code field */}
          <div className="join-field">
            <label className="join-label" htmlFor="input-room-code">Room Code</label>
            <div className="join-input-wrapper">
              {/* Key icon — thin line-art */}
              <svg className="join-input-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="15" r="5" />
                <path d="M12 12l8-8" />
                <path d="M20 4l-2 2" />
                <path d="M17 7l-2 2" />
              </svg>
              <input
                id="input-room-code"
                type="text"
                className="join-input"
                placeholder="Enter room code to join..."
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="join-actions">
            <button id="btn-join-room" type="submit" className="btn-join">
              Join
            </button>
            <button id="btn-create-room" type="button" className="btn-create" onClick={handleCreate}>
              Create Room
            </button>
          </div>
        </form>

        <p className="join-footer">No account needed. Pick a name and start writing.</p>
      </div>
    </div>
  );
}

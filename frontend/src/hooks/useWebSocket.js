import { useRef, useEffect, useCallback, useState } from 'react';

const WS_BASE = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

export function useWebSocket(roomId, username, onMessage) {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'

  // Keep the callback ref fresh
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!roomId || !username) return;

    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');

    const encodedUsername = encodeURIComponent(username);
    const ws = new WebSocket(`${WS_BASE}/ws/${roomId}?username=${encodedUsername}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      console.log(`[WS] Connected to room: ${roomId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      setStatus('disconnected');
      console.log(`[WS] Disconnected (code: ${event.code})`);

      // Auto-reconnect after 2 seconds unless intentionally closed
      if (event.code !== 1000) {
        reconnectTimerRef.current = setTimeout(() => {
          console.log('[WS] Attempting reconnect...');
          connect();
        }, 2000);
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }, [roomId, username]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User left');
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  // Connect when roomId/username change
  useEffect(() => {
    if (roomId && username) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [roomId, username, connect, disconnect]);

  return { status, send, disconnect };
}

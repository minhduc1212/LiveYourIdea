import { useEffect, useState, useRef, useCallback } from 'react';
import { Excalidraw, getSceneVersion } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

export default function Editor({ send, onMessage }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const isRemoteChange = useRef(false);
  const lastVersion = useRef(0);

  // Handle incoming messages from WebSocket
  useEffect(() => {
    if (!excalidrawAPI || !onMessage) return;

    const handler = (data) => {
      let elementsToApply = null;
      
      if (data.type === 'delta') {
        elementsToApply = data.delta;
      } else if (data.type === 'full_sync' && data.content) {
        try {
          elementsToApply = JSON.parse(data.content);
        } catch (err) {
          console.error('Failed to parse full sync:', err);
        }
      }

      if (elementsToApply) {
        isRemoteChange.current = true;
        try {
          excalidrawAPI.updateScene({ elements: elementsToApply });
          lastVersion.current = getSceneVersion(elementsToApply);
        } catch (err) {
          console.error('Failed to apply scene updates:', err);
        }
        
        // Excalidraw's onChange might fire slightly after updateScene,
        // so we hold the flag true for a brief moment.
        setTimeout(() => {
          isRemoteChange.current = false;
        }, 50);
      }
    };

    onMessage.current = handler;
  }, [excalidrawAPI, onMessage]);

  // Handle local drawing changes
  const handleChange = useCallback((elements) => {
    if (isRemoteChange.current) return; // Ignore updates caused by incoming data

    const version = getSceneVersion(elements);
    
    // Only broadcast if the scene has actually changed
    if (version > lastVersion.current) {
      lastVersion.current = version;
      
      send({
        type: 'delta',
        delta: elements,
      });

      // Debounce the full snapshot
      if (window.snapshotTimer) {
        clearTimeout(window.snapshotTimer);
      }
      window.snapshotTimer = setTimeout(() => {
        send({
          type: 'content_update',
          content: JSON.stringify(elements),
        });
      }, 1000);
    }
  }, [send]);

  return (
    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <Excalidraw 
        excalidrawAPI={(api) => setExcalidrawAPI(api)} 
        onChange={handleChange}
      />
    </div>
  );
}

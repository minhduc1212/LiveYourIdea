import { useEffect, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import 'tldraw/tldraw.css';

export default function Editor({ send, onMessage }) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  const [isReady, setIsReady] = useState(false);

  // Handle incoming messages and store listening
  useEffect(() => {
    setIsReady(true);
    let unlisten = null;

    const handler = (data) => {
      if (data.type === 'delta') {
        try {
          store.mergeRemoteChanges(() => {
            const { added, updated, removed } = data.delta;
            if (added) store.put(Object.values(added));
            if (updated) store.put(Object.values(updated).map(u => u[1]));
            if (removed) store.remove(Object.keys(removed));
          });
        } catch (err) {
          console.error('Failed to apply delta:', err);
        }
      } else if (data.type === 'full_sync' && data.content) {
        try {
          const snapshot = JSON.parse(data.content);
          store.loadSnapshot(snapshot);
        } catch (err) {
          console.error('Failed to apply full sync:', err);
        }
      }
    };

    if (onMessage) {
      onMessage.current = handler;
    }

    unlisten = store.listen(
      (update) => {
        if (update.source !== 'user') return;

        // Broadcast the delta
        send({
          type: 'delta',
          delta: update.changes,
        });

        // Periodically sync the entire snapshot to the server for new users
        if (window.snapshotTimer) {
          clearTimeout(window.snapshotTimer);
        }
        window.snapshotTimer = setTimeout(() => {
          send({
            type: 'content_update',
            content: JSON.stringify(store.getSnapshot()),
          });
        }, 1000);
      },
      { source: 'user', scope: 'document' }
    );

    return () => {
      if (unlisten) unlisten();
    };
  }, [store, send, onMessage]);

  if (!isReady) return <div style={{ padding: 20 }}>Loading canvas...</div>;

  return (
    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
      <Tldraw store={store} />
    </div>
  );
}

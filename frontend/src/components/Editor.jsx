import { useRef, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const MODULES = {
  toolbar: false, // We use our custom toolbar instead
};

export default function Editor({ send, onMessage, quillRef }) {
  const isRemoteChange = useRef(false);
  const contentSyncTimer = useRef(null);

  // Handle incoming messages from WebSocket
  useEffect(() => {
    if (!onMessage) return;

    const handler = (data) => {
      if (!quillRef.current) return;
      const editor = quillRef.current.getEditor();

      if (data.type === 'delta') {
        isRemoteChange.current = true;
        try {
          editor.updateContents(data.delta);
        } catch (err) {
          console.error('Failed to apply delta:', err);
        }
        isRemoteChange.current = false;
      } else if (data.type === 'full_sync' && data.content) {
        isRemoteChange.current = true;
        try {
          const delta = editor.clipboard.convert({ html: data.content });
          editor.setContents(delta);
        } catch (err) {
          console.error('Failed to apply full sync:', err);
        }
        isRemoteChange.current = false;
      }
    };

    onMessage.current = handler;
  }, [onMessage, quillRef]);

  // Handle local text changes
  const handleChange = useCallback((content, delta, source, editor) => {
    if (source !== 'user' || isRemoteChange.current) return;

    send({
      type: 'delta',
      delta: delta,
    });

    if (contentSyncTimer.current) {
      clearTimeout(contentSyncTimer.current);
    }
    contentSyncTimer.current = setTimeout(() => {
      send({
        type: 'content_update',
        content: editor.getHTML(),
      });
    }, 1000);
  }, [send]);

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      modules={MODULES}
      placeholder="Start writing your ideas..."
      onChange={handleChange}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  );
}

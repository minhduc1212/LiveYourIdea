import { useState, useEffect, useCallback } from 'react';

/**
 * Custom text-based toolbar that controls Quill formatting directly.
 * Uses Vietnamese labels with thin line-art icons.
 */
export default function CustomToolbar({ quillRef }) {
  const [formats, setFormats] = useState({});

  // Listen for Quill selection changes to track active formats
  useEffect(() => {
    if (!quillRef?.current) return;

    const editor = quillRef.current.getEditor();
    if (!editor) return;

    const onSelectionChange = (range) => {
      if (range) {
        setFormats(editor.getFormat(range) || {});
      }
    };

    const onTextChange = () => {
      const sel = editor.getSelection();
      if (sel) {
        setFormats(editor.getFormat(sel) || {});
      }
    };

    editor.on('selection-change', onSelectionChange);
    editor.on('text-change', onTextChange);

    return () => {
      editor.off('selection-change', onSelectionChange);
      editor.off('text-change', onTextChange);
    };
  }, [quillRef]);

  const toggleFormat = useCallback((format, value) => {
    if (!quillRef?.current) return;
    const editor = quillRef.current.getEditor();
    if (!editor) return;

    const current = editor.getFormat();
    if (format === 'blockquote') {
      editor.format(format, !current[format]);
    } else if (format === 'image') {
      const url = prompt('Enter image URL:');
      if (url) {
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', url);
      }
    } else {
      editor.format(format, !current[format]);
    }

    // Refresh formats
    const sel = editor.getSelection();
    if (sel) {
      setFormats(editor.getFormat(sel));
    }
  }, [quillRef]);

  const isActive = (format) => !!formats[format];

  return (
    <div className="custom-toolbar">
      {/* Bold */}
      <button
        type="button"
        className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
        onClick={() => toggleFormat('bold')}
        title="Bold"
      >
        <svg className="toolbar-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
          <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
        </svg>
        BOLD
      </button>

      {/* Italic */}
      <button
        type="button"
        className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
        onClick={() => toggleFormat('italic')}
        title="Italic"
      >
        <svg className="toolbar-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
        ITALIC
      </button>

      {/* Underline */}
      <button
        type="button"
        className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
        onClick={() => toggleFormat('underline')}
        title="Underline"
      >
        <svg className="toolbar-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v7a6 6 0 0 0 12 0V3" />
          <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
        UNDERLINE
      </button>

      {/* Blockquote */}
      <button
        type="button"
        className={`toolbar-btn hide-mobile ${isActive('blockquote') ? 'active' : ''}`}
        onClick={() => toggleFormat('blockquote')}
        title="Quote"
      >
        <svg className="toolbar-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
        QUOTE
      </button>

      {/* Image */}
      <button
        type="button"
        className="toolbar-btn hide-mobile"
        onClick={() => toggleFormat('image')}
        title="Image"
      >
        <svg className="toolbar-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="0" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        IMAGE
      </button>
    </div>
  );
}

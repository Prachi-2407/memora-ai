import { useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  favorite: boolean;
}

interface NoteEditorProps {
  onClose: () => void;
  onSave: (note: Note) => void;
  editingNote?: Note;
}

function NoteEditor({
  onClose,
  onSave,
  editingNote,
}: NoteEditorProps) {
  const [title, setTitle] = useState(editingNote?.title ?? "");
  const [content, setContent] = useState(editingNote?.content ?? "");
  const [tags, setTags] = useState(editingNote?.tags ?? "");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and content.");
      return;
    }

    onSave({
      id: editingNote?.id ?? Date.now(),
      title,
      content,
      tags,
      favorite: editingNote?.favorite ?? false,
    });
  };

  return (
    <div className="editor-overlay">
      <div className="note-editor">
        <div className="editor-header">
          <div>
            <h2>
              {editingNote ? "Edit Note" : "Create New Note"}
            </h2>

            <p>
              {editingNote
                ? "Update your note."
                : "Capture something worth remembering."}
            </p>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="editor-form">
          <label>
            Title

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter your note title..."
            />
          </label>

          <label>
            Content

            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Start writing your note..."
              rows={10}
            />
          </label>

          <label>
            Tags

            <input
              type="text"
              value={tags}
              onChange={(event) =>
                setTags(event.target.value)
              }
              placeholder="e.g. React, AI, Learning"
            />
          </label>
        </div>

        <div className="editor-footer">
          <button
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-button"
            onClick={handleSave}
          >
            {editingNote ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
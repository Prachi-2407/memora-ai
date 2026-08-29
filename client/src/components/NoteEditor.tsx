import { useState } from "react";
import type { Note } from "../App";

interface NoteEditorProps {
  editingNote: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
}

function NoteEditor({
  editingNote,
  onClose,
  onSave,
}: NoteEditorProps) {
  const [title, setTitle] = useState(
    editingNote?.title ?? ""
  );

  const [content, setContent] = useState(
    editingNote?.content ?? ""
  );

  const [tags, setTags] = useState(
    editingNote?.tags ?? ""
  );

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and content.");
      return;
    }

    const note: Note = {
    id: editingNote?.id ?? Date.now(),
    title,
    content,
    tags,
    favorite: editingNote?.favorite ?? false,
    deleted: editingNote?.deleted ?? false,
  };

    onSave(note);
  };

  const isEditing = Boolean(editingNote);

  return (
    <div
      className="editor-overlay"
      onClick={onClose}
    >
      <div
        className="note-editor"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="editor-header">
          <div>
            <h2>
              {isEditing
                ? "Edit Note"
                : "Create New Note"}
            </h2>

            <p>
              {isEditing
                ? "Update your note and keep your knowledge fresh."
                : "Capture something worth remembering."}
            </p>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close editor"
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
              autoFocus
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
            {isEditing
              ? "Update Note"
              : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
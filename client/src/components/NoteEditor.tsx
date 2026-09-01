import { useState } from "react";
import type { Note } from "../App";
import { aiAssist, type AIAssistAction } from "../api";

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

  const [aiLoadingAction, setAiLoadingAction] =
    useState<AIAssistAction | null>(null);

  const [aiFeedback, setAiFeedback] =
    useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setAiFeedback(msg);
    setTimeout(() => {
      setAiFeedback(null);
    }, 4000);
  };

  const handleAIAssist = async (action: AIAssistAction) => {
    if (!content.trim() && !title.trim()) {
      showFeedback("⚠️ Write some content or title first.");
      return;
    }

    try {
      setAiLoadingAction(action);
      setAiFeedback(null);

      const response = await aiAssist(action, content, title);
      const result = response.result?.trim();

      if (!result) {
        showFeedback("⚠️ No result generated.");
        return;
      }

      switch (action) {
        case "tags": {
          const newTags = result
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

          const existingTags = tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

          const merged = Array.from(
            new Set([...existingTags, ...newTags])
          ).join(", ");

          setTags(merged);
          showFeedback("✨ Tags generated and updated!");
          break;
        }

        case "title": {
          setTitle(result);
          showFeedback("✨ Title suggested!");
          break;
        }

        case "summarize": {
          const formattedSummary = `\n\n### Summary\n${result}`;
          setContent((prev) => `${prev.trim()}${formattedSummary}`);
          showFeedback("✨ Summary appended to note!");
          break;
        }

        case "polish": {
          setContent(result);
          showFeedback("✨ Note polished and formatted!");
          break;
        }
      }
    } catch (err) {
      console.error("AI assist error:", err);
      showFeedback(
        err instanceof Error ? `⚠️ ${err.message}` : "⚠️ AI Assist failed."
      );
    } finally {
      setAiLoadingAction(null);
    }
  };

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

        {/* AI ASSIST TOOLBAR */}
        <div className="editor-ai-toolbar">
          <div className="editor-ai-actions">
            <span className="editor-ai-label">✨ AI Assist:</span>

            <button
              type="button"
              className="editor-ai-btn"
              onClick={() => handleAIAssist("tags")}
              disabled={aiLoadingAction !== null || (!content.trim() && !title.trim())}
              title="Automatically generate topic tags"
            >
              {aiLoadingAction === "tags" ? "⏳ Generating..." : "🏷️ Auto-Tag"}
            </button>

            <button
              type="button"
              className="editor-ai-btn"
              onClick={() => handleAIAssist("title")}
              disabled={aiLoadingAction !== null || !content.trim()}
              title="Suggest a title from note content"
            >
              {aiLoadingAction === "title" ? "⏳ Suggesting..." : "💡 Suggest Title"}
            </button>

            <button
              type="button"
              className="editor-ai-btn"
              onClick={() => handleAIAssist("summarize")}
              disabled={aiLoadingAction !== null || !content.trim()}
              title="Append a concise summary"
            >
              {aiLoadingAction === "summarize" ? "⏳ Summarizing..." : "📝 Summarize"}
            </button>

            <button
              type="button"
              className="editor-ai-btn"
              onClick={() => handleAIAssist("polish")}
              disabled={aiLoadingAction !== null || !content.trim()}
              title="Polish grammar, clarity, and formatting"
            >
              {aiLoadingAction === "polish" ? "⏳ Polishing..." : "✍️ Polish"}
            </button>
          </div>

          {aiFeedback && (
            <div className="editor-ai-feedback">{aiFeedback}</div>
          )}
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
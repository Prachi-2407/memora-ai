import { useState } from "react";
import NoteEditor from "./components/NoteEditor";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  favorite: boolean;
}

function App() {
  const [showEditor, setShowEditor] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const handleSaveNote = (note: Note) => {
  setNotes((currentNotes) => [
    ...currentNotes,
    note,
  ]);

  const handleEditNote = (note: Note) => {
  setEditingNote(note);
  setShowEditor(true);
};

  setShowEditor(false);
};

const handleDeleteNote = (id: number) => {
  setNotes((currentNotes) =>
    currentNotes.filter((note) => note.id !== id)
  );
};

const handleToggleFavorite = (id: number) => {
  setNotes((currentNotes) =>
    currentNotes.map((note) =>
      note.id === id
        ? { ...note, favorite: !note.favorite }
        : note
    )
  );
};

const handleEditNote = (note: Note) => {
  setEditingNote(note);
  setShowEditor(true);
};

  return (
    <div className="app">
      <Navbar />

      <div className="app-body">
        <Sidebar onNewNote={() => setShowEditor(true)} />

        <main className="main-content">
          <section className="welcome-section">
            <div>
              <h1>Welcome back, Prachi 👋</h1>
              <p>Your knowledge, organized.</p>
            </div>

            <button
              className="new-note-main"
              onClick={() => setShowEditor(true)}
            >
            + New Note
            </button>
          </section>

          <div className="search-bar">
            🔍
            <input
              type="text"
              placeholder="Search your notes..."
            />
          </div>

          <section className="stats">
            <div className="stat-card">
              <span>📝</span>
              <div>
                <h3>24</h3>
                <p>Total Notes</p>
              </div>
            </div>

            <div className="stat-card">
              <span>🏷️</span>
              <div>
                <h3>18</h3>
                <p>Total Tags</p>
              </div>
            </div>

            <div className="stat-card">
              <span>🤖</span>
              <div>
                <h3>56</h3>
                <p>AI Interactions</p>
              </div>
            </div>

            <div className="stat-card">
              <span>⭐</span>
              <div>
                <h3>12</h3>
                <p>Favorites</p>
              </div>
            </div>
          </section>

          <section className="content-grid">
            <div className="notes-section">
              <div className="section-heading">
                <h2>Recent Notes</h2>
                <button>View All →</button>
              </div>

              <div className="notes-grid">
                <article className="note-card">
                  <div className="note-icon">📝</div>
                  <h3>Learning React</h3>
                  <p>
                    Today I learned about components,
                    props and state.
                  </p>
                  <span className="note-tag">React</span>
                </article>

                <article className="note-card">
                  <div className="note-icon">💡</div>
                  <h3>System Design</h3>
                  <p>
                    Understanding caching, databases
                    and APIs.
                  </p>
                  <span className="note-tag">System Design</span>
                </article>

                <article className="note-card">
                  <div className="note-icon">🤖</div>
                  <h3>AI & RAG</h3>
                  <p>
                    Learning about embeddings and
                    retrieval augmented generation.
                  </p>
                  <span className="note-tag">AI</span>
                </article>
              
              {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <div className="note-icon">📝</div>

                  <button
                    className="favorite-button"
                    onClick={() => handleToggleFavorite(note.id)}
                  >
                    {note.favorite ? "⭐" : "☆"}
                  </button>

                  
                </div>

                <h3>{note.title}</h3>

                <p>{note.content}</p>

                {note.tags && (
                  <span className="note-tag">
                    {note.tags}
                  </span>
                )}

                <button
                  className="edit-button"
                  onClick={() => handleEditNote(note)}
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  🗑️ Delete
                </button>
              </article>
            ))}
            </div>
            </div>

            <aside className="ai-card">
              <div className="ai-icon">✨</div>

              <h2>Ask MemoraAI</h2>

              <p>
                Ask anything about your notes.
              </p>

              <div className="ai-input">
                <input
                  type="text"
                  placeholder="What do you want to know?"
                />

                <button>➤</button>
              </div>

              <div className="suggestions">
                <button>
                  Summarize my notes
                </button>

                <button>
                  What did I learn about React?
                </button>

                <button>
                  Find my notes about AI
                </button>
              </div>
            </aside>
          </section>
                </main>
      </div>

      {showEditor && (
  <NoteEditor
    onClose={() => {
      setShowEditor(false);
      setEditingNote(null);
    }}
    onSave={(note) => {
      if (editingNote) {
        setNotes((currentNotes) =>
          currentNotes.map((oldNote) =>
            oldNote.id === note.id ? note : oldNote
          )
        );
      } else {
        handleSaveNote(note);
      }

      setShowEditor(false);
      setEditingNote(null);
    }}
    editingNote={editingNote ?? undefined}
  />
)}
    </div>
  );
}

export default App;
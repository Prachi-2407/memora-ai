import { useState } from "react";
import NoteEditor from "./components/NoteEditor";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AIAssistant from "./components/AIAssistant";

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  favorite: boolean;
  deleted: boolean;
}

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Learning React",
    content:
      "Today I learned about components, props and state.",
    tags: "React",
    favorite: false,
    deleted: false,
  },
  {
    id: 2,
    title: "System Design",
    content:
      "Understanding caching, databases and APIs.",
    tags: "System Design",
    favorite: false,
    deleted: false,
  },
  {
    id: 3,
    title: "AI & RAG",
    content:
      "Learning about embeddings and retrieval augmented generation.",
    tags: "AI",
    favorite: false,
    deleted: false,
  },
];

function App() {
  const [notes, setNotes] =
    useState<Note[]>(initialNotes);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState<Note | null>(null);

  const [showFavorites, setShowFavorites] =
    useState(false);

  const [showTrash, setShowTrash] =
    useState(false);

  const [showTags, setShowTags] =
    useState(false);

  const [showAI, setShowAI] =
    useState(false);

  const [selectedTag, setSelectedTag] =
    useState<string | null>(null);

  const openNewNote = () => {
    setEditingNote(null);
    setShowFavorites(false);
    setShowTrash(false);
    setShowTags(false);
    setShowAI(false);
    setSelectedTag(null);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const saveNote = (note: Note) => {
    setNotes((currentNotes) => {
      const exists = currentNotes.some(
        (oldNote) =>
          oldNote.id === note.id
      );

      if (exists) {
        return currentNotes.map(
          (oldNote) =>
            oldNote.id === note.id
              ? note
              : oldNote
        );
      }

      return [
        ...currentNotes,
        {
          ...note,
          deleted: false,
        },
      ];
    });

    closeEditor();
  };

  const moveToTrash = (id: number) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              deleted: true,
              favorite: false,
            }
          : note
      )
    );
  };

  const restoreNote = (id: number) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              deleted: false,
            }
          : note
      )
    );
  };

  const permanentlyDelete = (id: number) => {
    setNotes((currentNotes) =>
      currentNotes.filter(
        (note) => note.id !== id
      )
    );
  };

  const toggleFavorite = (id: number) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              favorite: !note.favorite,
            }
          : note
      )
    );
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setShowTrash(false);
    setShowFavorites(false);
    setShowTags(false);
    setShowAI(false);
    setSelectedTag(null);
    setShowEditor(true);
  };

  const openAllNotes = () => {
    setShowFavorites(false);
    setShowTrash(false);
    setShowTags(false);
    setShowAI(false);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const openFavorites = () => {
    setShowFavorites(true);
    setShowTrash(false);
    setShowTags(false);
    setShowAI(false);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const openTrash = () => {
    setShowFavorites(false);
    setShowTrash(true);
    setShowTags(false);
    setShowAI(false);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const openTags = () => {
    setShowFavorites(false);
    setShowTrash(false);
    setShowTags(true);
    setShowAI(false);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const openAI = () => {
    setShowFavorites(false);
    setShowTrash(false);
    setShowTags(false);
    setShowAI(true);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const activeNotes = notes.filter(
    (note) => !note.deleted
  );

  const availableTags = Array.from(
    new Set(
      activeNotes
        .flatMap((note) =>
          note.tags.split(",")
        )
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const visibleNotes = notes.filter((note) => {
    if (showTrash) {
      return note.deleted;
    }

    if (note.deleted) {
      return false;
    }

    if (showTags) {
      if (!selectedTag) {
        return false;
      }

      const noteTags = note.tags
        .split(",")
        .map((tag) =>
          tag.trim().toLowerCase()
        );

      return noteTags.includes(
        selectedTag.toLowerCase()
      );
    }

    const matchesSearch =
      normalizedSearch === "" ||
      `${note.title} ${note.content} ${note.tags}`
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesFavorites =
      !showFavorites ||
      note.favorite;

    return (
      matchesSearch &&
      matchesFavorites
    );
  });

  const favoriteCount =
    activeNotes.filter(
      (note) => note.favorite
    ).length;

  return (
    <div className="app">
      <Navbar />

      <div className="app-body">
        <Sidebar
          onNewNote={openNewNote}
          onFavorites={openFavorites}
          onAllNotes={openAllNotes}
          onTrash={openTrash}
          onTags={openTags}
          onAIAsk={openAI}
          showingFavorites={showFavorites}
          showingTrash={showTrash}
          showingTags={showTags}
          showingAI={showAI}
        />

        <main className="main-content">
          {showAI ? (
            <AIAssistant
              notes={activeNotes}
            />
          ) : (
            <>
              <section className="welcome-section">
                <div>
                  <h1>
                    Welcome back, Prachi 👋
                  </h1>

                  <p>
                    Your knowledge, organized.
                  </p>
                </div>

                <button
                  className="new-note-main"
                  onClick={openNewNote}
                >
                  + New Note
                </button>
              </section>

              {!showTrash &&
                !showTags && (
                  <div className="search-bar">
                    <span>🔍</span>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                      placeholder="Search your notes..."
                    />
                  </div>
                )}

              <section className="stats">
                <div className="stat-card">
                  <span>📝</span>

                  <div>
                    <h3>
                      {activeNotes.length}
                    </h3>

                    <p>Total Notes</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>🏷️</span>

                  <div>
                    <h3>
                      {availableTags.length}
                    </h3>

                    <p>Total Tags</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>🤖</span>

                  <div>
                    <h3>0</h3>

                    <p>AI Interactions</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>⭐</span>

                  <div>
                    <h3>
                      {favoriteCount}
                    </h3>

                    <p>Favorites</p>
                  </div>
                </div>
              </section>

              <section className="content-grid">
                <div className="notes-section">
                  <div className="section-heading">
                    <div>
                      <h2>
                        {showTrash
                          ? "Trash"
                          : showTags
                          ? selectedTag
                            ? `# ${selectedTag}`
                            : "Tags"
                          : showFavorites
                          ? "Favorite Notes"
                          : searchTerm
                          ? "Search Results"
                          : "Recent Notes"}
                      </h2>

                      {!showTags && (
                        <p className="section-subtitle">
                          {visibleNotes.length}{" "}
                          {visibleNotes.length ===
                          1
                            ? "note"
                            : "notes"}
                        </p>
                      )}
                    </div>

                    {showFavorites && (
                      <button
                        className="text-button"
                        onClick={openAllNotes}
                      >
                        View All →
                      </button>
                    )}

                    {showTags &&
                      selectedTag && (
                        <button
                          className="text-button"
                          onClick={() =>
                            setSelectedTag(
                              null
                            )
                          }
                        >
                          All Tags →
                        </button>
                      )}
                  </div>

                  {showTags &&
                  !selectedTag ? (
                    <div className="notes-grid">
                      {availableTags.map(
                        (tag) => {
                          const count =
                            activeNotes.filter(
                              (note) =>
                                note.tags
                                  .split(",")
                                  .map((item) =>
                                    item
                                      .trim()
                                      .toLowerCase()
                                  )
                                  .includes(
                                    tag.toLowerCase()
                                  )
                            ).length;

                          return (
                            <button
                              className="note-card tag-card"
                              key={tag}
                              onClick={() =>
                                setSelectedTag(
                                  tag
                                )
                              }
                            >
                              <div className="note-icon">
                                🏷️
                              </div>

                              <h3>
                                {tag}
                              </h3>

                              <p>
                                {count}{" "}
                                {count === 1
                                  ? "note"
                                  : "notes"}
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : visibleNotes.length ===
                    0 ? (
                    <div className="empty-state">
                      <div>
                        {showTrash
                          ? "🗑️"
                          : "📝"}
                      </div>

                      <h3>
                        {showTrash
                          ? "Trash is empty"
                          : "No notes found"}
                      </h3>

                      <p>
                        {showTrash
                          ? "Deleted notes will appear here."
                          : "Try another search or create a new note."}
                      </p>

                      {!showTrash && (
                        <button
                          className="new-note-main"
                          onClick={
                            openNewNote
                          }
                        >
                          + Create Note
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="notes-grid">
                      {visibleNotes.map(
                        (note) => (
                          <article
                            className="note-card"
                            key={note.id}
                          >
                            <div className="note-card-top">
                              <div className="note-icon">
                                {showTrash
                                  ? "🗑️"
                                  : "📝"}
                              </div>

                              {!showTrash && (
                                <button
                                  className="favorite-button"
                                  onClick={() =>
                                    toggleFavorite(
                                      note.id
                                    )
                                  }
                                >
                                  {note.favorite
                                    ? "⭐"
                                    : "☆"}
                                </button>
                              )}
                            </div>

                            <h3>
                              {note.title}
                            </h3>

                            <p>
                              {note.content}
                            </p>

                            {note.tags && (
                              <span className="note-tag">
                                {note.tags}
                              </span>
                            )}

                            <div className="note-actions">
                              {showTrash ? (
                                <>
                                  <button
                                    className="edit-button"
                                    onClick={() =>
                                      restoreNote(
                                        note.id
                                      )
                                    }
                                  >
                                    ↩️ Restore
                                  </button>

                                  <button
                                    className="delete-button"
                                    onClick={() =>
                                      permanentlyDelete(
                                        note.id
                                      )
                                    }
                                  >
                                    🗑️ Delete Forever
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="edit-button"
                                    onClick={() =>
                                      editNote(
                                        note
                                      )
                                    }
                                  >
                                    ✏️ Edit
                                  </button>

                                  <button
                                    className="delete-button"
                                    onClick={() =>
                                      moveToTrash(
                                        note.id
                                      )
                                    }
                                  >
                                    🗑️ Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </div>

                {!showTrash &&
                  !showTags && (
                    <aside className="ai-card">
                      <div className="ai-icon">
                        ✨
                      </div>

                      <h2>
                        Ask MemoraAI
                      </h2>

                      <p>
                        Ask anything about your
                        notes.
                      </p>

                      <button
                        className="new-note-main"
                        onClick={openAI}
                      >
                        ✨ Open AI Assistant
                      </button>

                      <div className="suggestions">
                        <button
                          onClick={openAI}
                        >
                          Summarize my notes
                        </button>

                        <button
                          onClick={openAI}
                        >
                          What did I learn about React?
                        </button>

                        <button
                          onClick={openAI}
                        >
                          Find my notes about AI
                        </button>
                      </div>
                    </aside>
                  )}
              </section>
            </>
          )}
        </main>
      </div>

      {showEditor && (
        <NoteEditor
          editingNote={editingNote}
          onClose={closeEditor}
          onSave={saveNote}
        />
      )}
    </div>
  );
}

export default App;
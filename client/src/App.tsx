import {
  useEffect,
  useState,
} from "react";

import NoteEditor from "./components/NoteEditor";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AIAssistant from "./components/AIAssistant";
import Auth from "./components/Auth";
import AIHistory from "./components/AIHistory";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote as deleteNoteFromAPI,
  getAIInteractionCount,
  getAuthToken,
  getCurrentUser,
  logout,
  type User,
} from "./api";

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string;
  favorite: boolean;
  deleted: boolean;
}

function App() {
  /* ================= AUTH ================= */

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    checkingAuth,
    setCheckingAuth,
  ] =
    useState(true);

  /* ================= NOTES ================= */

  const [
    notes,
    setNotes,
  ] =
    useState<Note[]>(
      []
    );

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    showEditor,
    setShowEditor,
  ] =
    useState(false);

  const [
    editingNote,
    setEditingNote,
  ] =
    useState<Note | null>(
      null
    );

  const [
    showFavorites,
    setShowFavorites,
  ] =
    useState(false);

  const [
    showTrash,
    setShowTrash,
  ] =
    useState(false);

  const [
    showTags,
    setShowTags,
  ] =
    useState(false);

  const [
    showAI,
    setShowAI,
  ] =
    useState(false);

  const [
    showHistory,
    setShowHistory,
  ] =
    useState(false);

  const [
    aiInteractions,
    setAiInteractions,
  ] =
    useState(0);

  const [
    selectedTag,
    setSelectedTag,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* =====================================================
     CHECK EXISTING AUTH
  ===================================================== */

  useEffect(() => {
    const checkAuth =
      async () => {
        const token =
          getAuthToken();

        if (!token) {
          setCheckingAuth(
            false
          );

          return;
        }

        try {
          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser
          );
        } catch (
          error
        ) {
          console.error(
            "Authentication check failed:",
            error
          );

          logout();

          setUser(
            null
          );
        } finally {
          setCheckingAuth(
            false
          );
        }
      };

    checkAuth();
  }, []);

  /* =====================================================
     LOAD USER DATA
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadData =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            null
          );

          const data =
            await getNotes();

          setNotes(
            data
          );

          const count =
            await getAIInteractionCount();

          setAiInteractions(
            count
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to load MemoraAI data:",
            error
          );

          setError(
            "Unable to load your MemoraAI data."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, [user]);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const resetViews =
    () => {
      setShowFavorites(
        false
      );

      setShowTrash(
        false
      );

      setShowTags(
        false
      );

      setShowAI(
        false
      );

      setShowHistory(
        false
      );

      setSelectedTag(
        null
      );

      setSearchTerm(
        ""
      );
    };

  const openNewNote =
    () => {
      resetViews();

      setEditingNote(
        null
      );

      setShowEditor(
        true
      );
    };

  const closeEditor =
    () => {
      setShowEditor(
        false
      );

      setEditingNote(
        null
      );
    };

  const openAllNotes =
    () => {
      resetViews();
    };

  const openFavorites =
    () => {
      resetViews();

      setShowFavorites(
        true
      );
    };

  const openTrash =
    () => {
      resetViews();

      setShowTrash(
        true
      );
    };

  const openTags =
    () => {
      resetViews();

      setShowTags(
        true
      );
    };

  const openAI =
    () => {
      resetViews();

      setShowAI(
        true
      );
    };

  const openHistory =
    () => {
      resetViews();

      setShowHistory(
        true
      );
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    () => {
      logout();

      setUser(
        null
      );

      setNotes(
        []
      );

      setAiInteractions(
        0
      );

      resetViews();

      setShowEditor(
        false
      );

      setEditingNote(
        null
      );

      setError(
        null
      );
    };

  /* =====================================================
     SAVE NOTE
  ===================================================== */

  const saveNote =
    async (
      note: Note
    ) => {
      try {
        setError(
          null
        );

        if (
          editingNote
        ) {
          const updatedNote =
            await updateNote(
              note.id,
              note
            );

          setNotes(
            (
              currentNotes
            ) =>
              currentNotes.map(
                (
                  oldNote
                ) =>
                  oldNote.id ===
                  updatedNote.id
                    ? updatedNote
                    : oldNote
              )
          );
        } else {
          const noteData =
            {
              title:
                note.title,

              content:
                note.content,

              tags:
                note.tags,

              favorite:
                note.favorite,

              deleted:
                false,
            };

          const createdNote =
            await createNote(
              noteData
            );

          setNotes(
            (
              currentNotes
            ) => [
              createdNote,
              ...currentNotes,
            ]
          );
        }

        closeEditor();
      } catch (
        error
      ) {
        console.error(
          "Failed to save note:",
          error
        );

        setError(
          "Unable to save the note."
        );
      }
    };

  /* =====================================================
     EDIT NOTE
  ===================================================== */

  const editNote =
    (
      note: Note
    ) => {
      resetViews();

      setEditingNote(
        note
      );

      setShowEditor(
        true
      );
    };

  /* =====================================================
     FAVORITE
  ===================================================== */

  const toggleFavorite =
    async (
      id: number
    ) => {
      const note =
        notes.find(
          (
            note
          ) =>
            note.id ===
            id
        );

      if (!note) {
        return;
      }

      const updatedNote: Note =
        {
          ...note,

          favorite:
            !note.favorite,
        };

      try {
        setError(
          null
        );

        const savedNote =
          await updateNote(
            id,
            updatedNote
          );

        setNotes(
          (
            currentNotes
          ) =>
            currentNotes.map(
              (
                currentNote
              ) =>
                currentNote.id ===
                id
                  ? savedNote
                  : currentNote
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to update favorite:",
          error
        );

        setError(
          "Unable to update favorite."
        );
      }
    };

  /* =====================================================
     MOVE TO TRASH
  ===================================================== */

  const moveToTrash =
    async (
      id: number
    ) => {
      const note =
        notes.find(
          (
            note
          ) =>
            note.id ===
            id
        );

      if (!note) {
        return;
      }

      const updatedNote: Note =
        {
          ...note,

          deleted:
            true,

          favorite:
            false,
        };

      try {
        setError(
          null
        );

        const savedNote =
          await updateNote(
            id,
            updatedNote
          );

        setNotes(
          (
            currentNotes
          ) =>
            currentNotes.map(
              (
                currentNote
              ) =>
                currentNote.id ===
                id
                  ? savedNote
                  : currentNote
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to move note to trash:",
          error
        );

        setError(
          "Unable to move note to trash."
        );
      }
    };

  /* =====================================================
     RESTORE NOTE
  ===================================================== */

  const restoreNote =
    async (
      id: number
    ) => {
      const note =
        notes.find(
          (
            note
          ) =>
            note.id ===
            id
        );

      if (!note) {
        return;
      }

      const restoredNote: Note =
        {
          ...note,

          deleted:
            false,
        };

      try {
        setError(
          null
        );

        const savedNote =
          await updateNote(
            id,
            restoredNote
          );

        setNotes(
          (
            currentNotes
          ) =>
            currentNotes.map(
              (
                currentNote
              ) =>
                currentNote.id ===
                id
                  ? savedNote
                  : currentNote
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to restore note:",
          error
        );

        setError(
          "Unable to restore note."
        );
      }
    };

  /* =====================================================
     PERMANENT DELETE
  ===================================================== */

  const permanentlyDelete =
    async (
      id: number
    ) => {
      try {
        setError(
          null
        );

        await deleteNoteFromAPI(
          id
        );

        setNotes(
          (
            currentNotes
          ) =>
            currentNotes.filter(
              (
                note
              ) =>
                note.id !==
                id
            )
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to permanently delete note:",
          error
        );

        setError(
          "Unable to permanently delete note."
        );
      }
    };

  /* =====================================================
     NOTE CALCULATIONS
  ===================================================== */

  const activeNotes =
    notes.filter(
      (
        note
      ) =>
        !note.deleted
    );

  const availableTags =
    Array.from(
      new Set(
        activeNotes
          .flatMap(
            (
              note
            ) =>
              note.tags.split(
                ","
              )
          )
          .map(
            (
              tag
            ) =>
              tag.trim()
          )
          .filter(
            Boolean
          )
      )
    );

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  const visibleNotes =
    notes.filter(
      (
        note
      ) => {
        if (
          showTrash
        ) {
          return note.deleted;
        }

        if (
          note.deleted
        ) {
          return false;
        }

        if (
          showTags
        ) {
          if (
            !selectedTag
          ) {
            return false;
          }

          const noteTags =
            note.tags
              .split(
                ","
              )
              .map(
                (
                  tag
                ) =>
                  tag
                    .trim()
                    .toLowerCase()
              );

          return noteTags.includes(
            selectedTag.toLowerCase()
          );
        }

        const matchesSearch =
          normalizedSearch ===
            "" ||
          `${note.title} ${note.content} ${note.tags}`
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesFavorites =
          !showFavorites ||
          note.favorite;

        return (
          matchesSearch &&
          matchesFavorites
        );
      }
    );

  const favoriteCount =
    activeNotes.filter(
      (
        note
      ) =>
        note.favorite
    ).length;

  const totalTags =
    availableTags.length;

  /* =====================================================
     AUTH LOADING
  ===================================================== */

  if (
    checkingAuth
  ) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-logo">
            🧠
          </div>

          <h2>
            Loading MemoraAI...
          </h2>

        </div>

      </div>
    );
  }

  /* =====================================================
     LOGIN / SIGNUP
  ===================================================== */

  if (!user) {
    return (
      <Auth
        onAuthenticated={(
          loggedInUser
        ) => {
          setUser(
            loggedInUser
          );
        }}
      />
    );
  }

  /* =====================================================
     MAIN APP
  ===================================================== */

  return (
    <div className="app">

      <Navbar />

      <div className="app-body">

        <Sidebar
          onNewNote={
            openNewNote
          }

          onFavorites={
            openFavorites
          }

          onAllNotes={
            openAllNotes
          }

          onTrash={
            openTrash
          }

          onTags={
            openTags
          }

          onAIAsk={
            openAI
          }

          onAIHistory={
            openHistory
          }

          onLogout={
            handleLogout
          }

          showingFavorites={
            showFavorites
          }

          showingTrash={
            showTrash
          }

          showingTags={
            showTags
          }

          showingAI={
            showAI
          }

          showingHistory={
            showHistory
          }

          userName={
            user.name
          }
        />

        <main className="main-content">

          {/* ================= AI ASSISTANT ================= */}

          {showAI ? (

            <AIAssistant
              notes={
                activeNotes
              }

              onInteraction={() =>
                setAiInteractions(
                  (
                    count
                  ) =>
                    count +
                    1
                )
              }
            />

          ) : showHistory ? (

            /* ================= AI HISTORY ================= */

            <AIHistory />

          ) : (

            <>
              {/* ================= WELCOME ================= */}

              <section className="welcome-section">

                <div>

                  <h1>
                    Welcome back,{" "}
                    {
                      user.name
                    }{" "}
                    👋
                  </h1>

                  <p>
                    Your knowledge,
                    organized.
                  </p>

                </div>

                <button
                  className="new-note-main"
                  onClick={
                    openNewNote
                  }
                >
                  + New Note
                </button>

              </section>

              {/* ================= ERROR ================= */}

              {error && (
                <div className="error-message">
                  ⚠️{" "}
                  {
                    error
                  }
                </div>
              )}

              {/* ================= SEARCH ================= */}

              {!showTrash &&
                !showTags && (

                  <div className="search-bar">

                    <span>
                      🔍
                    </span>

                    <input
                      type="text"

                      value={
                        searchTerm
                      }

                      onChange={(
                        event
                      ) =>
                        setSearchTerm(
                          event
                            .target
                            .value
                        )
                      }

                      placeholder="Search your notes..."
                    />

                  </div>

                )}

              {/* ================= STATS ================= */}

              {!showTrash &&
                !showTags && (

                  <section className="stats">

                    <div className="stat-card">

                      <span>
                        📝
                      </span>

                      <div>

                        <h3>
                          {
                            activeNotes.length
                          }
                        </h3>

                        <p>
                          Total Notes
                        </p>

                      </div>

                    </div>

                    <div className="stat-card">

                      <span>
                        🏷️
                      </span>

                      <div>

                        <h3>
                          {
                            totalTags
                          }
                        </h3>

                        <p>
                          Total Tags
                        </p>

                      </div>

                    </div>

                    <div className="stat-card">

                      <span>
                        🤖
                      </span>

                      <div>

                        <h3>
                          {
                            aiInteractions
                          }
                        </h3>

                        <p>
                          AI Interactions
                        </p>

                      </div>

                    </div>

                    <div className="stat-card">

                      <span>
                        ⭐
                      </span>

                      <div>

                        <h3>
                          {
                            favoriteCount
                          }
                        </h3>

                        <p>
                          Favorites
                        </p>

                      </div>

                    </div>

                  </section>

                )}

              {/* ================= CONTENT ================= */}

              <section className="content-grid">

                <div className="notes-section">

                  <div className="section-heading">

                    <div>

                      <h2>
                        {
                          showTrash
                            ? "Trash"
                            : showTags
                            ? selectedTag
                              ? `Notes tagged "${selectedTag}"`
                              : "Tags"
                            : showFavorites
                            ? "Favorite Notes"
                            : searchTerm
                            ? "Search Results"
                            : "Recent Notes"
                        }
                      </h2>

                      {(
                        !showTags ||
                        selectedTag
                      ) && (

                        <p className="section-subtitle">

                          {
                            visibleNotes.length
                          }{" "}

                          {
                            visibleNotes.length ===
                            1
                              ? "note"
                              : "notes"
                          }

                        </p>

                      )}

                    </div>

                    {showFavorites && (

                      <button
                        className="text-button"

                        onClick={
                          openAllNotes
                        }
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
                          ← All Tags
                        </button>

                      )}

                  </div>

                  {/* ================= TAG VIEW ================= */}

                  {showTags &&
                  !selectedTag ? (

                    <div className="notes-grid">

                      {availableTags.map(
                        (
                          tag
                        ) => {
                          const count =
                            activeNotes.filter(
                              (
                                note
                              ) =>
                                note.tags
                                  .split(
                                    ","
                                  )
                                  .map(
                                    (
                                      item
                                    ) =>
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

                              key={
                                tag
                              }

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
                                {
                                  tag
                                }
                              </h3>

                              <p>

                                {
                                  count
                                }{" "}

                                {
                                  count ===
                                  1
                                    ? "note"
                                    : "notes"
                                }

                              </p>

                            </button>

                          );
                        }
                      )}

                    </div>

                  ) : loading ? (

                    /* ================= LOADING ================= */

                    <div className="empty-state">

                      <div>
                        ⏳
                      </div>

                      <h3>
                        Loading your
                        notes...
                      </h3>

                      <p>
                        Connecting to
                        MemoraAI server.
                      </p>

                    </div>

                  ) : visibleNotes.length ===
                    0 ? (

                    /* ================= EMPTY ================= */

                    <div className="empty-state">

                      <div>

                        {
                          showTrash
                            ? "🗑️"
                            : "📝"
                        }

                      </div>

                      <h3>

                        {
                          showTrash
                            ? "Trash is empty"
                            : showFavorites
                            ? "No favorite notes"
                            : "No notes found"
                        }

                      </h3>

                      <p>

                        {
                          showTrash
                            ? "Deleted notes will appear here."
                            : showFavorites
                            ? "Favorite a note and it will appear here."
                            : "Try another search or create a new note."
                        }

                      </p>

                      {!showTrash &&
                        !showTags &&
                        !showFavorites && (

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

                    /* ================= NOTES GRID ================= */

                    <div className="notes-grid">

                      {visibleNotes.map(
                        (
                          note
                        ) => (

                          <article
                            className="note-card"

                            key={
                              note.id
                            }
                          >

                            <div className="note-card-top">

                              <div className="note-icon">

                                {
                                  showTrash
                                    ? "🗑️"
                                    : "📝"
                                }

                              </div>

                              {!showTrash && (

                                <button
                                  className="favorite-button"

                                  onClick={() =>
                                    toggleFavorite(
                                      note.id
                                    )
                                  }

                                  aria-label={
                                    note.favorite
                                      ? "Remove from favorites"
                                      : "Add to favorites"
                                  }
                                >

                                  {
                                    note.favorite
                                      ? "⭐"
                                      : "☆"
                                  }

                                </button>

                              )}

                            </div>

                            <h3>
                              {
                                note.title
                              }
                            </h3>

                            <p>
                              {
                                note.content
                              }
                            </p>

                            {note.tags && (

                              <span className="note-tag">
                                {
                                  note.tags
                                }
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

                {/* ================= AI CARD ================= */}

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
                        Ask anything
                        about your notes.
                      </p>

                      <button
                        className="new-note-main"

                        onClick={
                          openAI
                        }
                      >
                        ✨ Open AI Assistant
                      </button>

                      <div className="suggestions">

                        <button
                          onClick={
                            openAI
                          }
                        >
                          Summarize my notes
                        </button>

                        <button
                          onClick={
                            openAI
                          }
                        >
                          What did I learn about React?
                        </button>

                        <button
                          onClick={
                            openAI
                          }
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

      {/* ================= NOTE EDITOR ================= */}

      {showEditor && (

        <NoteEditor
          editingNote={
            editingNote
          }

          onClose={
            closeEditor
          }

          onSave={
            saveNote
          }
        />

      )}

    </div>
  );
}

export default App;
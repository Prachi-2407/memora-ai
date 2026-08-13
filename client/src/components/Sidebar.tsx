interface SidebarProps {
  onNewNote: () => void;
  onFavorites: () => void;
  onAllNotes: () => void;
  onTrash: () => void;
  onTags: () => void;
  onAIAsk: () => void;

  showingFavorites: boolean;
  showingTrash: boolean;
  showingTags: boolean;
  showingAI: boolean;
}

function Sidebar({
  onNewNote,
  onFavorites,
  onAllNotes,
  onTrash,
  onTags,
  onAIAsk,
  showingFavorites,
  showingTrash,
  showingTags,
  showingAI,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* LOGO */}

      <div className="sidebar-logo">
        <div className="logo-mark">M</div>

        <div>
          <h2>MemoraAI</h2>
          <span>Your second brain</span>
        </div>
      </div>

      {/* NEW NOTE */}

      <button
        className="sidebar-new-note"
        onClick={onNewNote}
      >
        <span>＋</span>
        New Note
      </button>

      {/* NAVIGATION */}

      <nav className="sidebar-nav">
        <button
          className={
            !showingFavorites &&
            !showingTrash &&
            !showingTags &&
            !showingAI
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onAllNotes}
        >
          <span>🏠</span>
          <span>All Notes</span>
        </button>

        <button
          className={
            showingFavorites
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onFavorites}
        >
          <span>⭐</span>
          <span>Favorites</span>
        </button>

        <button
          className={
            showingTags
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onTags}
        >
          <span>🏷️</span>
          <span>Tags</span>
        </button>

        <button
          className={
            showingTrash
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onTrash}
        >
          <span>🗑️</span>
          <span>Trash</span>
        </button>

        {/* AI ASK */}

        <button
          className={
            showingAI
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onAIAsk}
        >
          <span>✨</span>
          <span>Ask MemoraAI</span>
        </button>
      </nav>

      {/* BOTTOM */}

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />

        <button className="sidebar-item">
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">
            P
          </div>

          <div>
            <strong>Prachi</strong>
            <span>Personal workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
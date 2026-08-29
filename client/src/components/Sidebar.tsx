interface SidebarProps {
  onNewNote: () => void;
  onFavorites: () => void;
  onAllNotes: () => void;
  onTrash: () => void;
  onTags: () => void;
  onAIAsk: () => void;
  onAIHistory: () => void;
  onLogout: () => void;

  showingFavorites: boolean;
  showingTrash: boolean;
  showingTags: boolean;
  showingAI: boolean;
  showingHistory: boolean;

  userName: string;
}

function Sidebar({
  onNewNote,
  onFavorites,
  onAllNotes,
  onTrash,
  onTags,
  onAIAsk,
  onAIHistory,
  onLogout,

  showingFavorites,
  showingTrash,
  showingTags,
  showingAI,
  showingHistory,

  userName,
}: SidebarProps) {
  const isAllNotes =
    !showingFavorites &&
    !showingTrash &&
    !showingTags &&
    !showingAI &&
    !showingHistory;

  const avatarLetter =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "M";

  return (
    <aside className="sidebar">

      {/* ================= LOGO ================= */}

      <div className="sidebar-logo">

        <div className="logo-mark">
          M
        </div>

        <div>
          <h2>
            MemoraAI
          </h2>

          <span>
            Your second brain
          </span>
        </div>

      </div>

      {/* ================= NEW NOTE ================= */}

      <button
        className="sidebar-new-note"
        onClick={onNewNote}
      >
        <span>
          ＋
        </span>

        New Note
      </button>

      {/* ================= NAVIGATION ================= */}

      <nav className="sidebar-nav">

        {/* ALL NOTES */}

        <button
          className={
            isAllNotes
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onAllNotes}
        >
          <span>
            🏠
          </span>

          <span>
            All Notes
          </span>
        </button>

        {/* FAVORITES */}

        <button
          className={
            showingFavorites
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onFavorites}
        >
          <span>
            ⭐
          </span>

          <span>
            Favorites
          </span>
        </button>

        {/* TAGS */}

        <button
          className={
            showingTags
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onTags}
        >
          <span>
            🏷️
          </span>

          <span>
            Tags
          </span>
        </button>

        {/* AI ASSISTANT */}

        <button
          className={
            showingAI
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onAIAsk}
        >
          <span>
            ✨
          </span>

          <span>
            Ask MemoraAI
          </span>
        </button>

        {/* AI HISTORY */}

        <button
          className={
            showingHistory
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onAIHistory}
        >
          <span>
            🕘
          </span>

          <span>
            AI History
          </span>
        </button>

        {/* TRASH */}

        <button
          className={
            showingTrash
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={onTrash}
        >
          <span>
            🗑️
          </span>

          <span>
            Trash
          </span>
        </button>

      </nav>

      {/* ================= BOTTOM ================= */}

      <div className="sidebar-bottom">

        <div className="sidebar-divider" />

        {/* SETTINGS */}

        <button
          className="sidebar-item"
          type="button"
        >
          <span>
            ⚙️
          </span>

          <span>
            Settings
          </span>
        </button>

        {/* LOGOUT */}

        <button
          className="sidebar-item sidebar-logout"
          type="button"
          onClick={onLogout}
        >
          <span>
            🚪
          </span>

          <span>
            Logout
          </span>
        </button>

        {/* PROFILE */}

        <div className="sidebar-profile">

          <div className="profile-avatar">
            {avatarLetter}
          </div>

          <div>
            <strong>
              {userName}
            </strong>

            <span>
              Personal workspace
            </span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
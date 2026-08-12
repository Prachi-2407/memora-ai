interface SidebarProps {
  onNewNote: () => void;
}

function Sidebar({ onNewNote }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
      className="new-note-button"
      onClick={onNewNote}
      >
  + New Note
</button>

      <nav className="sidebar-nav">
        <a className="nav-item active">
          🏠
          <span>Dashboard</span>
        </a>

        <a className="nav-item">
          📝
          <span>Notes</span>
        </a>

        <a className="nav-item">
          ✨
          <span>AI Ask</span>
        </a>

        <a className="nav-item">
          🏷️
          <span>Tags</span>
        </a>

        <a className="nav-item">
          ⭐
          <span>Favorites</span>
        </a>

        <a className="nav-item">
          🗑️
          <span>Trash</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <a className="nav-item">
          ⚙️
          <span>Settings</span>
        </a>

        <a className="nav-item">
          ↪️
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
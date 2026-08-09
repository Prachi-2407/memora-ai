function Sidebar() {
  return (
    <aside className="sidebar">
      <button className="new-note-button">
        + New Note
      </button>

      <nav className="sidebar-nav">
        <button className="sidebar-item active">
          📝
          <span>All Notes</span>
        </button>

        <button className="sidebar-item">
          ⭐
          <span>Favorites</span>
        </button>

        <button className="sidebar-item">
          🗑️
          <span>Trash</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <p>Memora AI</p>
        <span>Your personal knowledge space.</span>
      </div>
    </aside>
  )
}

export default Sidebar
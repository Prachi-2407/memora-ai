function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="mobile-logo">
          M
        </div>

        <div>
          <h1>MemoraAI</h1>
          <span>Knowledge, organized.</span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="navbar-icon-button"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="navbar-divider" />

        <div className="navbar-user">
          <div className="navbar-avatar">
            P
          </div>

          <div className="navbar-user-info">
            <strong>Prachi</strong>
            <span>Personal</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">M</div>
        <span>MemoraAI</span>
      </div>

      <div className="navbar-right">
        <button className="icon-button">🔔</button>

        <div className="profile">
          <div className="avatar">P</div>
          <span>Prachi</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
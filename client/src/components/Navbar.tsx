type NavbarProps = {
  title: string
}

function Navbar({ title }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="logo">M</div>
        <h2>{title}</h2>
      </div>

      <div className="navbar-actions">
        <button className="icon-button">🔔</button>
        <div className="avatar">P</div>
      </div>
    </header>
  )
}

export default Navbar
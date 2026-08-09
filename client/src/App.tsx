import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import NoteCard from './components/NoteCard'

function App() {
  return (
    <div className="app">
      <Navbar title="Memora AI" />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          <div className="welcome-section">
            <div>
              <h1>Welcome back 👋</h1>
              <p>Your knowledge, organized.</p>
            </div>

            <button className="new-note-main-button">
              + New Note
            </button>
          </div>

          <div className="search-container">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search your notes..."
            />
          </div>

          <section className="notes-section">
            <div className="section-header">
              <h2>Your Notes</h2>
              <span>3 notes</span>
            </div>

            <div className="notes-grid">
              <NoteCard
                title="Learning React"
                content="Today I learned about components, props and how React builds user interfaces."
                date="Aug 9, 2026"
              />

              <NoteCard
                title="System Design"
                content="Understanding caching, databases, APIs and how large systems communicate."
                date="Aug 8, 2026"
              />

              <NoteCard
                title="AI & RAG"
                content="Learning how embeddings and retrieval augmented generation can make AI useful."
                date="Aug 7, 2026"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
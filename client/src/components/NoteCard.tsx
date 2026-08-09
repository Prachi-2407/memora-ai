type NoteCardProps = {
  title: string
  content: string
  date: string
}

function NoteCard({ title, content, date }: NoteCardProps) {
  return (
    <article className="note-card">
      <div className="note-card-top">
        <span className="note-icon">📝</span>

        <button className="more-button">
          ⋯
        </button>
      </div>

      <h3>{title}</h3>

      <p>{content}</p>

      <span className="note-date">{date}</span>
    </article>
  )
}

export default NoteCard
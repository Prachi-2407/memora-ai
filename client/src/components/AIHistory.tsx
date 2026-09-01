import { useEffect, useState } from "react";
import { getAIHistory, type AIInteraction } from "../api";

function AIHistory() {
  const [history, setHistory] = useState<AIInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAIHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load AI history:", err);
        setError("Unable to load AI history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="ai-history">
        <div className="empty-state">
          <div>⏳</div>
          <h3>Loading AI conversations...</h3>
          <p>Connecting to MemoraAI server.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-history">
        <div className="error-message">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="ai-history">
      <div className="ai-history-header">
        <div>
          <h1>AI History</h1>
          <p>Review your previous conversations with MemoraAI.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div>🤖</div>
          <h3>No AI conversations yet</h3>
          <p>Ask MemoraAI a question and your conversation will appear here.</p>
        </div>
      ) : (
        <div className="ai-history-list">
          {history.map((interaction) => (
            <article className="ai-history-card" key={interaction.id}>
              <div className="ai-history-question">
                <span>🧠</span>
                <div>
                  <strong>You asked</strong>
                  <p>{interaction.question}</p>
                </div>
              </div>

              <div className="ai-history-answer">
                <span>✨</span>
                <div>
                  <strong>MemoraAI</strong>
                  <p>{interaction.answer}</p>
                </div>
              </div>

              <div className="ai-history-date">
                {new Date(interaction.created_at).toLocaleString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIHistory;
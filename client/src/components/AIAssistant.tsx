import { useState } from "react";
import { askAI, type AISource } from "../api";
import type { Note } from "../App";

interface AIAssistantProps {
  notes: Note[];
  onInteraction?: (question: string, answer: string) => void;
}

function AIAssistant({
  notes,
  onInteraction,
}: AIAssistantProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<AISource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSources([]);

      const result = await askAI(trimmedQuestion);

      const aiAnswer =
        result.answer || "I couldn't generate an answer from your notes.";
      setAnswer(aiAnswer);
      setSources(result.sources || []);

      if (onInteraction) {
        onInteraction(trimmedQuestion, aiAnswer);
      }
    } catch (err) {
      console.error("AI request failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to get an answer from MemoraAI."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setQuestion(text);
  };

  const activeNotesCount = notes.filter((n) => !n.deleted).length;

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div>
          <div className="ai-icon">✨</div>
          <h1>Ask MemoraAI</h1>
          <p>
            Ask anything about your notes and get AI-powered answers grounded in your knowledge base.
          </p>
        </div>
      </div>

      <div className="ai-content">
        <div className="ai-input-section">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask something about your notes..."
            rows={4}
          />

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            {loading ? "✨ Thinking..." : "✨ Ask MemoraAI"}
          </button>
        </div>

        {!answer && !loading && !error && (
          <div className="ai-suggestions">
            <h3>Try asking:</h3>
            <button
              onClick={() =>
                handleSuggestion("Summarize the key points from my notes")
              }
            >
              Summarize the key points from my notes
            </button>
            <button
              onClick={() =>
                handleSuggestion("What did I learn about React?")
              }
            >
              What did I learn about React?
            </button>
            <button
              onClick={() =>
                handleSuggestion("What are the main topics in my notes?")
              }
            >
              What are the main topics in my notes?
            </button>
          </div>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner">✨</div>
            <p>Searching and analyzing your notes...</p>
          </div>
        )}

        {error && (
          <div className="ai-error">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        {answer && !loading && (
          <div className="ai-response">
            <div className="ai-answer">
              <div className="ai-answer-header">
                <span>🤖</span>
                <h2>MemoraAI</h2>
              </div>
              <p>{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className="ai-sources">
                <h3>📚 Sources</h3>
                <div className="source-list">
                  {sources.map((source) => (
                    <div className="source-item" key={source.id}>
                      <span>📝</span>
                      <span>{source.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="ai-note-count">
          <span>🧠</span>
          Searching across <strong>{activeNotesCount}</strong> active note
          {activeNotesCount === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
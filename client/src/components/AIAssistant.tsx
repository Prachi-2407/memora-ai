import { useState } from "react";
import { askAI } from "../api";
import type { Note } from "../App";

interface AIAssistantProps {
  notes: Note[];
  onInteraction: () => void;
}

function AIAssistant({
  notes,
  onInteraction,
}: AIAssistantProps) {
  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [sources, setSources] =
    useState<
      {
        id: number;
        title: string;
      }[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleAsk = async () => {
    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSources([]);

      const result =
        await askAI(
          trimmedQuestion
        );

      setAnswer(result.answer);
      setSources(result.sources);
      onInteraction();
    } catch (error) {
      console.error(
        "AI request failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to get an answer from MemoraAI."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (
    suggestion: string
  ) => {
    setQuestion(suggestion);
  };

  return (
    <div className="ai-assistant">

      <div className="ai-header">
        <div>
          <div className="ai-icon">
            ✨
          </div>

          <h1>
            Ask MemoraAI
          </h1>

          <p>
            Ask questions about your
            personal knowledge base.
          </p>
        </div>
      </div>

      <div className="ai-content">

        <div className="ai-input-section">

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask something about your notes..."
            rows={4}
          />

          <button
            onClick={handleAsk}
            disabled={
              loading ||
              !question.trim()
            }
          >
            {loading
              ? "Thinking..."
              : "✨ Ask MemoraAI"}
          </button>

        </div>

        {!answer &&
          !loading &&
          !error && (
            <div className="ai-suggestions">

              <h3>
                Try asking:
              </h3>

              <button
                onClick={() =>
                  handleSuggestion(
                    "What did I learn about React?"
                  )
                }
              >
                What did I learn about React?
              </button>

              <button
                onClick={() =>
                  handleSuggestion(
                    "What did I learn about SQLite?"
                  )
                }
              >
                What did I learn about SQLite?
              </button>

              <button
                onClick={() =>
                  handleSuggestion(
                    "What are the main topics in my notes?"
                  )
                }
              >
                What are the main topics
                in my notes?
              </button>

            </div>
          )}

        {loading && (
          <div className="ai-loading">

            <div className="ai-spinner">
              ✨
            </div>

            <p>
              Searching your notes...
            </p>

          </div>
        )}

        {error && (
          <div className="ai-error">

            <strong>
              Something went wrong
            </strong>

            <p>
              {error}
            </p>

          </div>
        )}

        {answer &&
          !loading && (
            <div className="ai-response">

              <div className="ai-answer">

                <div className="ai-answer-header">

                  <span>
                    🤖
                  </span>

                  <h2>
                    MemoraAI
                  </h2>

                </div>

                <p>
                  {answer}
                </p>

              </div>

              {sources.length > 0 && (
                <div className="ai-sources">

                  <h3>
                    📚 Sources
                  </h3>

                  <div className="source-list">

                    {sources.map(
                      (source) => (
                        <div
                          className="source-item"
                          key={source.id}
                        >
                          <span>
                            📝
                          </span>

                          <span>
                            {source.title}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        <div className="ai-note-count">

          <span>
            🧠
          </span>

          Searching across{" "}

          <strong>
            {notes.filter(
              (note) => !note.deleted
            ).length}
          </strong>{" "}

          active notes

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;
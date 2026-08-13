import { useState } from "react";
import type { Note } from "../App";

interface AIAssistantProps {
  notes: Note[];
}

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

function AIAssistant({ notes }: AIAssistantProps) {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Hi! I'm MemoraAI. Ask me anything about your notes.",
    },
  ]);

  const askQuestion = (text: string) => {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmedQuestion,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setQuestion("");

    const lowerQuestion =
      trimmedQuestion.toLowerCase();

    let answer =
      "I couldn't find anything relevant in your notes yet.";

    const matchingNotes = notes.filter((note) => {
      const noteText =
        `${note.title} ${note.content} ${note.tags}`.toLowerCase();

      const words = lowerQuestion
        .split(/\s+/)
        .filter((word) => word.length > 2);

      return words.some((word) =>
        noteText.includes(word)
      );
    });

    if (matchingNotes.length > 0) {
      answer =
        `I found ${matchingNotes.length} relevant ${
          matchingNotes.length === 1
            ? "note"
            : "notes"
        }:\n\n` +
        matchingNotes
          .map(
            (note) =>
              `📝 ${note.title}\n${note.content}`
          )
          .join("\n\n");
    }

    const aiMessage: Message = {
      id: Date.now() + 1,
      role: "ai",
      text: answer,
    };

    setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    }, 500);
  };

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    askQuestion(question);
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <div className="ai-icon">
          ✨
        </div>

        <div>
          <h2>Ask MemoraAI</h2>

          <p>
            Ask anything about your notes.
          </p>
        </div>
      </div>

      <div className="ai-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ai-message user-message"
                : "ai-message"
            }
          >
            <div className="message-avatar">
              {message.role === "user"
                ? "P"
                : "✨"}
            </div>

            <div className="message-content">
              <span>
                {message.role === "user"
                  ? "You"
                  : "MemoraAI"}
              </span>

              <p>
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        className="ai-question-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder="Ask something about your notes..."
        />

        <button type="submit">
          ➤
        </button>
      </form>

      <div className="ai-suggestions">
        <button
          onClick={() =>
            askQuestion(
              "What did I learn about React?"
            )
          }
        >
          What did I learn about React?
        </button>

        <button
          onClick={() =>
            askQuestion(
              "Show me my AI notes"
            )
          }
        >
          Show me my AI notes
        </button>

        <button
          onClick={() =>
            askQuestion(
              "Summarize my notes"
            )
          }
        >
          Summarize my notes
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
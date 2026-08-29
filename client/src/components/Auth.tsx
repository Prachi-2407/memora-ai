import { useState } from "react";
import {
  login,
  signup,
  type User,
} from "../api";

interface AuthProps {
  onAuthenticated: (user: User) => void;
}

function Auth({
  onAuthenticated,
}: AuthProps) {
  const [isSignup, setIsSignup] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = isSignup
        ? await signup(
            name,
            email,
            password
          )
        : await login(
            email,
            password
          );

      onAuthenticated(
        result.user
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          🧠
        </div>

        <h1>MemoraAI</h1>

        <p className="auth-subtitle">
          Your personal AI-powered
          knowledge base.
        </p>

        <h2>
          {isSignup
            ? "Create your account"
            : "Welcome back"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {isSignup && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            minLength={6}
            required
          />

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <div className="auth-switch">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsSignup(
                !isSignup
              );

              setError("");
            }}
          >
            {isSignup
              ? "Login"
              : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Auth;
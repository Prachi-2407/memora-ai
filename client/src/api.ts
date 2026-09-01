import type { Note } from "./App";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001/api";

/* ================= AUTH TYPES ================= */

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/* ================= AI TYPES ================= */

export interface AISource {
  id: number;
  title: string;
}

export interface AIResponse {
  answer: string;
  sources: AISource[];
}

/* ================= TOKEN HELPERS ================= */

export function setAuthToken(
  token: string
) {
  localStorage.setItem(
    "memoraai_token",
    token
  );
}

export function getAuthToken() {
  return localStorage.getItem(
    "memoraai_token"
  );
}

export function clearAuthToken() {
  localStorage.removeItem(
    "memoraai_token"
  );
}

function getAuthHeaders(): Record<
  string,
  string
> {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ================= RESPONSE HANDLER ================= */

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message =
      "Something went wrong";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message =
          data.message;
      }
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

/* ================= AUTH ================= */

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_URL}/auth/signup`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data =
    await handleResponse<AuthResponse>(
      response
    );

  setAuthToken(data.token);

  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data =
    await handleResponse<AuthResponse>(
      response
    );

  setAuthToken(data.token);

  return data;
}

export function logout() {
  clearAuthToken();
}

/* ================= NOTES ================= */

export async function getNotes(): Promise<
  Note[]
> {
  const response = await fetch(
    `${API_URL}/notes`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse<Note[]>(
    response
  );
}

export async function createNote(
  note: Omit<Note, "id">
): Promise<Note> {
  const response = await fetch(
    `${API_URL}/notes`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body: JSON.stringify(
        note
      ),
    }
  );

  return handleResponse<Note>(
    response
  );
}

export async function updateNote(
  id: number,
  note: Partial<Note>
): Promise<Note> {
  const response = await fetch(
    `${API_URL}/notes/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body: JSON.stringify(
        note
      ),
    }
  );

  return handleResponse<Note>(
    response
  );
}

export async function deleteNote(
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_URL}/notes/${id}`,
    {
      method: "DELETE",

      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  await handleResponse(
    response
  );
}

/* ================= AI ================= */

export async function askAI(
  question: string
): Promise<AIResponse> {
  const response = await fetch(
    `${API_URL}/ai/ask`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...getAuthHeaders(),
      },

      body: JSON.stringify({
        question,
      }),
    }
  );

  return handleResponse<AIResponse>(
    response
  );
}

/* ================= AI INTERACTION COUNT ================= */

export async function getAIInteractionCount(): Promise<number> {
  const response = await fetch(
    `${API_URL}/ai/interactions/count`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data =
    await handleResponse<{
      count: number;
    }>(response);

  return data.count;
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const data =
    await handleResponse<{
      user: User;
    }>(response);

  return data.user;
}

export interface AIInteraction {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export async function getAIHistory(): Promise<
  AIInteraction[]
> {
  const response = await fetch(
    `${API_URL}/ai/interactions`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return handleResponse<
    AIInteraction[]
  >(response);
}

/* ================= AI ASSIST IN NOTE EDITOR ================= */

export type AIAssistAction = "tags" | "summarize" | "polish" | "title";

export interface AIAssistResponse {
  result: string;
  action: AIAssistAction;
}

export async function aiAssist(
  action: AIAssistAction,
  content: string,
  title?: string
): Promise<AIAssistResponse> {
  const response = await fetch(`${API_URL}/ai/assist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      action,
      content,
      title,
    }),
  });

  return handleResponse<AIAssistResponse>(response);
}
<div align="center">

# 🧠 MemoraAI
### *Your Personal AI-Powered Knowledge Base & Second Brain*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)

<p align="center">
  <a href="[https://memora-ai.vercel.app](https://memora-ai-zeta.vercel.app)">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_MemoraAI-7C3AED?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <b>Capture thoughts, organize notes with smart tags, and converse with your knowledge base using semantic vector search powered by Google Gemini.</b>
</p>

---

</div>

## 🌟 Highlights & Features

### 🤖 1. Retrieval-Augmented Generation (RAG)
* **Ask MemoraAI**: Converse with your personal notes using Google Gemini.
* **Semantic Vector Search**: Calculates cosine similarity on note embeddings to retrieve only the most relevant notes for grounded answers.
* **Source Citations**: Displays which notes were referenced to answer your question.
* **AI History**: Logs all your past queries and answers in PostgreSQL.

### ✨ 2. Intelligent Note Editor AI Assist
* **🏷️ Auto-Tagging**: Analyzes note title and body to suggest 3–5 relevant topic tags.
* **💡 Title Generator**: Automatically crafts punchy, descriptive titles from your content.
* **📝 Summarizer**: Appends a clean bulleted summary/TL;DR to your note.
* **✍️ Writing Polisher**: Cleans up grammar, typos, and organizes text with structured Markdown.

### 📝 3. Effortless Note Management
* **Instant Search & Filter**: Real-time keyword search and tag-based categorization.
* **Favorites & Trash**: Star important notes or move items to trash with one-click restore and permanent delete options.
* **Notifications Center**: Real-time alerts for note actions, edits, and deletions.

### 🌙 4. Modern UI & Persistent Dark Mode
* **Sleek Aesthetic**: Minimalist card design with fluid animations and responsive mobile layouts.
* **Persistent Themes**: Auto-saves your Light/Dark theme preference in `localStorage`.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[React 19 + TypeScript Client] -->|REST API / JSON| B[Express.js Server]
    B -->|JWT Authentication| C[(PostgreSQL Database)]
    B -->|Embeddings & Generation| D[Google Gemini API]
    
    subgraph PostgreSQL Tables
        C --> T1[users]
        C --> T2[notes]
        C --> T3[note_embeddings]
        C --> T4[ai_interactions]
    end
    
    subgraph Gemini AI Engine
        D --> M1[gemini-embedding-2]
        D --> M2[gemini-3.6-flash]
    end
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Custom CSS3 Variables |
| **Backend** | Node.js, Express, TypeScript, `@google/genai`, `pg`, `bcryptjs`, `jsonwebtoken`, `cors` |
| **Database** | PostgreSQL (Neon / Supabase / Local) |
| **AI Models** | `gemini-3.6-flash` (Generative Q&A), `gemini-embedding-2` (Vector Embeddings) |
| **Deployment** | Vercel (Frontend Client), Render (Backend API), Neon (Cloud PostgreSQL) |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **PostgreSQL** instance (local or free cloud database on [Neon.tech](https://neon.tech))
* **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Clone the Repository
```bash
git clone https://github.com/Prachi-2407/memora-ai.git
cd memora-ai
```

---

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/memoraai
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
```

Run database migrations:
```bash
# Execute schema in your database
psql -d memoraai -f src/database/schema.sql
```

Start the backend:
```bash
npm run dev
```
> Server runs on `http://localhost:5001`

---

### 4. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_URL=http://127.0.0.1:5001/api
```

Start the frontend:
```bash
npm run dev
```
> App runs on `http://localhost:5173`

---

## 🗄️ Database Schema

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT DEFAULT '',
  favorite BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Interactions History
CREATE TABLE IF NOT EXISTS ai_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Note Vector Embeddings
CREATE TABLE IF NOT EXISTS note_embeddings (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL UNIQUE REFERENCES notes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  embedding JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Production Deployment

| Service | Hosting Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | [Vercel](https://vercel.com) | [memora-ai.vercel.app](https://YOUR-APP.vercel.app) |
| **Backend API** | [Render](https://render.com) | [memora-ai-whmx.onrender.com](https://memora-ai-whmx.onrender.com/api/health) |
| **Database** | [Neon](https://neon.tech) | PostgreSQL (Serverless) |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Made with ❤️ by <b>Prachi</b>
</div>

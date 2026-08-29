import "dotenv/config";

import express from "express";
import cors from "cors";

import notesRouter from "./routes/notes";
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";

const app = express();

const PORT =
  Number(process.env.PORT) || 5001;

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= BASIC ROUTES ================= */

app.get("/", (_req, res) => {
  res.json({
    message:
      "MemoraAI server is running 🚀",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message:
      "MemoraAI API is healthy",
  });
});

/* ================= API ROUTES ================= */

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/notes",
  notesRouter
);

app.use(
  "/api/ai",
  aiRouter
);

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(
    `🚀 MemoraAI server running on http://localhost:${PORT}`
  );
});
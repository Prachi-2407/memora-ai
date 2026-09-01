import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

import pool from "../database/postgres";

import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth";

import {
  createEmbedding,
  cosineSimilarity,
} from "../services/embeddings";

const router = Router();

/* =====================================================
   GEMINI SETUP
===================================================== */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing from server/.env"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

/*
  All AI routes require authentication.
*/
router.use(requireAuth);

/* =====================================================
   TYPES
===================================================== */

interface EmbeddedNoteRow {
  id: number;
  title: string;
  content: string;
  tags: string;
  embedding: number[];
}

interface RankedNote {
  id: number;
  title: string;
  content: string;
  tags: string;
  similarity: number;
}

/* =====================================================
   GET AI INTERACTION COUNT
===================================================== */

router.get(
  "/interactions/count",
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const result = await pool.query<{
        count: string;
      }>(
        `
        SELECT COUNT(*) AS count
        FROM ai_interactions
        WHERE user_id = $1
        `,
        [userId]
      );

      const count = Number(
        result.rows[0]?.count ?? 0
      );

      return res.json({
        count,
      });
    } catch (error) {
      console.error(
        "Failed to count AI interactions:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get AI interaction count",
      });
    }
  }
);

/* =====================================================
   GET AI INTERACTION HISTORY
===================================================== */

router.get(
  "/interactions",
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const result = await pool.query<{
        id: number;
        question: string;
        answer: string;
        created_at: string;
      }>(
        `
        SELECT
          id,
          question,
          answer,
          created_at
        FROM ai_interactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [userId]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error(
        "Failed to fetch AI history:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch AI interaction history",
      });
    }
  }
);

/* =====================================================
   POST /api/ai/ask
===================================================== */

router.post(
  "/ask",
  async (req: AuthRequest, res) => {
    try {
      /* =================================================
         1. AUTHENTICATION
      ================================================= */

      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      /* =================================================
         2. VALIDATE QUESTION
      ================================================= */

      const { question } = req.body;

      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          message: "Question is required",
        });
      }

      const cleanQuestion = question.trim();

      /* =================================================
         3. CREATE QUESTION EMBEDDING
      ================================================= */

      const questionEmbedding =
        await createEmbedding(cleanQuestion);

      /* =================================================
         4. GET USER'S ACTIVE NOTES
      ================================================= */

      const result =
        await pool.query<EmbeddedNoteRow>(
          `
          SELECT
            n.id,
            n.title,
            n.content,
            n.tags,
            e.embedding
          FROM notes n
          INNER JOIN note_embeddings e
            ON e.note_id = n.id
          WHERE
            n.user_id = $1
            AND e.user_id = $1
            AND n.deleted = FALSE
          `,
          [userId]
        );

      const notes = result.rows;

      /* =================================================
         5. NO NOTES
      ================================================= */

      if (notes.length === 0) {
        const answer =
          "You don't have any searchable notes yet.";

        await saveInteraction(
          userId,
          cleanQuestion,
          answer
        );

        return res.json({
          answer,
          sources: [],
        });
      }

      /* =================================================
         6. CALCULATE COSINE SIMILARITY
      ================================================= */

      const rankedNotes: RankedNote[] =
        notes
          .map((note) => {
            const similarity =
              cosineSimilarity(
                questionEmbedding,
                note.embedding
              );

            return {
              id: note.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              similarity,
            };
          })
          .sort(
            (a, b) =>
              b.similarity - a.similarity
          );

      /* =================================================
         7. TOP-K RETRIEVAL
      ================================================= */

      const TOP_K = 3;
      const RELEVANCE_THRESHOLD = 0.25;

      const topNotes =
        rankedNotes.slice(0, TOP_K);

      const relevantNotes =
        topNotes.filter(
          (note) =>
            note.similarity >=
            RELEVANCE_THRESHOLD
        );

      /* =================================================
         8. NO RELEVANT NOTES
      ================================================= */

      if (relevantNotes.length === 0) {
        const answer =
          "I couldn't find enough relevant information in your notes to answer that question.";

        await saveInteraction(
          userId,
          cleanQuestion,
          answer
        );

        return res.json({
          answer,
          sources: [],
        });
      }

      /* =================================================
         9. BUILD RAG CONTEXT
      ================================================= */

      const context =
        relevantNotes
          .map(
            (note, index) => `
SOURCE ${index + 1}

Note ID: ${note.id}
Title: ${note.title}
Content: ${note.content}
Tags: ${note.tags}
`
          )
          .join(
            "\n--------------------\n"
          );

      /* =================================================
         10. BUILD PROMPT
      ================================================= */

      const prompt = `
You are MemoraAI, an AI-powered personal knowledge assistant.

Your job is to answer the user's question using ONLY
the information contained in the retrieved notes.

IMPORTANT RULES:

1. Use only information from the retrieved notes.
2. Never invent facts.
3. Never use outside knowledge.
4. If the notes do not contain enough information,
   clearly say that.
5. Combine multiple notes when useful.
6. Keep the answer concise and easy to understand.
7. Do not mention similarity scores.
8. Do not mention that you are using embeddings.
9. Do not mention the internal retrieval process.

USER QUESTION:

${cleanQuestion}

RETRIEVED NOTES:

${context}

Answer the user's question using only the notes above.
`;

      /* =================================================
         11. CALL GEMINI
      ================================================= */

      const response =
        await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
          contents: prompt,
        });

      const answer =
        response.text?.trim() ||
        "I couldn't generate an answer from your notes.";

      /* =================================================
         12. SAVE INTERACTION
      ================================================= */

      await saveInteraction(
        userId,
        cleanQuestion,
        answer
      );

      /* =================================================
         13. RETURN RESPONSE
      ================================================= */

      return res.json({
        answer,

        sources: relevantNotes.map(
          (note) => ({
            id: note.id,
            title: note.title,
            similarity: Number(
              note.similarity.toFixed(4)
            ),
          })
        ),
      });
    } catch (error: any) {
      console.error(
        "PostgreSQL semantic RAG error:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to generate AI response",
      });
    }
  }
);

/* =====================================================
   POST /api/ai/assist
===================================================== */

router.post(
  "/assist",
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const { action, content, title } = req.body;

      if (!action || typeof action !== "string") {
        return res.status(400).json({
          message: "Action is required",
        });
      }

      const safeTitle = typeof title === "string" ? title.trim() : "";
      const safeContent = typeof content === "string" ? content.trim() : "";

      if (!safeContent && !safeTitle) {
        return res.status(400).json({
          message: "Please write some title or content first.",
        });
      }

      let prompt = "";

      switch (action) {
        case "tags":
          prompt = `Analyze the following note and generate 3 to 6 concise, relevant topic tags.
Rules:
- Return ONLY a comma-separated list of tags (for example: React, JavaScript, State Management, Frontend)
- Do NOT include hashtags (#), quotes, numbers, or explanations.
- Capitalize each tag properly.

Title: ${safeTitle || "Untitled"}
Content:
${safeContent}`;
          break;

        case "summarize":
          prompt = `Provide a clear, concise summary of the following note.
Rules:
- Give a 2 to 3 bullet point summary capturing the key ideas.
- Return ONLY the summary bullets.
- Do NOT include introductory phrases like "Here is a summary:".

Title: ${safeTitle || "Untitled"}
Content:
${safeContent}`;
          break;

        case "polish":
          prompt = `Polish and improve the writing, clarity, and formatting of this note.
Rules:
- Fix any grammar mistakes, typos, and formatting inconsistencies.
- Organize with clean Markdown (bullet points, bolding for key terms where appropriate).
- Preserve the author's original facts and meaning.
- Return ONLY the polished note text with NO meta-talk or introductory remarks.

Title: ${safeTitle || "Untitled"}
Content:
${safeContent}`;
          break;

        case "title":
          prompt = `Generate a clear, descriptive, and concise title (3 to 7 words) for this note.
Rules:
- Return ONLY the title text.
- Do NOT wrap in quotes or add labels.

Content:
${safeContent || safeTitle}`;
          break;

        default:
          return res.status(400).json({
            message: `Unsupported action: ${action}`,
          });
      }

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
        contents: prompt,
      });

      const result = response.text?.trim() || "";

      return res.json({
        result,
        action,
      });
    } catch (error: any) {
      console.error("AI assist error:", error);
      return res.status(500).json({
        message: error?.message || "Failed to generate AI assist response",
      });
    }
  }
);

/* =====================================================
   SAVE AI INTERACTION
===================================================== */

async function saveInteraction(
  userId: number,
  question: string,
  answer: string
) {
  await pool.query(
    `
    INSERT INTO ai_interactions
    (
      user_id,
      question,
      answer
    )
    VALUES ($1, $2, $3)
    `,
    [
      userId,
      question,
      answer,
    ]
  );
}

/* =====================================================
   EXPORT
===================================================== */

export default router;
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

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing from server/.env"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

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
   AI INTERACTION COUNT
===================================================== */

router.get(
  "/interactions/count",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      const result =
        await pool.query<{
          count: string;
        }>(
          `
          SELECT COUNT(*) AS count
          FROM ai_interactions
          WHERE user_id = $1
          `,
          [userId]
        );

      const count =
        Number(
          result.rows[0]?.count ??
            0
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
   AI INTERACTION HISTORY
===================================================== */

router.get(
  "/interactions",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      const result =
        await pool.query<{
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

      return res.json(
        result.rows
      );
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
   ASK MEMORAAI
===================================================== */

router.post(
  "/ask",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      const {
        question,
      } = req.body;

      if (
        typeof question !==
          "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          message:
            "Question is required",
        });
      }

      const cleanQuestion =
        question.trim();

      /* =============================================
         1. QUESTION EMBEDDING
      ============================================= */

      const questionEmbedding =
        await createEmbedding(
          cleanQuestion
        );

      /* =============================================
         2. LOAD USER NOTES + EMBEDDINGS
      ============================================= */

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

          WHERE n.user_id = $1
            AND e.user_id = $1
            AND n.deleted = FALSE
          `,
          [userId]
        );

      const notes =
        result.rows;

      if (
        notes.length === 0
      ) {
        return res.json({
          answer:
            "You don't have any searchable notes yet.",
          sources: [],
        });
      }

      /* =============================================
         3. RANK NOTES BY COSINE SIMILARITY
      ============================================= */

      const rankedNotes: RankedNote[] =
        notes
          .map((note) => {
            const similarity =
              cosineSimilarity(
                questionEmbedding,
                note.embedding
              );

            return {
              id:
                note.id,

              title:
                note.title,

              content:
                note.content,

              tags:
                note.tags,

              similarity,
            };
          })
          .sort(
            (
              a,
              b
            ) =>
              b.similarity -
              a.similarity
          );

      /* =============================================
         4. TOP-K RETRIEVAL
      ============================================= */

      const TOP_K = 3;

      const RELEVANCE_THRESHOLD =
        0.25;

      const topNotes =
        rankedNotes.slice(
          0,
          TOP_K
        );

      const relevantNotes =
        topNotes.filter(
          (note) =>
            note.similarity >=
            RELEVANCE_THRESHOLD
        );

      if (
        relevantNotes.length ===
        0
      ) {
        const answer =
          "I couldn't find enough relevant information in your notes to answer that question.";

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
            cleanQuestion,
            answer,
          ]
        );

        return res.json({
          answer,
          sources: [],
        });
      }

      /* =============================================
         5. BUILD CONTEXT
      ============================================= */

      const context =
        relevantNotes
          .map(
            (
              note,
              index
            ) => `
SOURCE ${index + 1}

Note ID: ${note.id}
Title: ${note.title}
Content: ${note.content}
Tags: ${note.tags}
Similarity Score: ${note.similarity.toFixed(
              4
            )}
`
          )
          .join(
            "\n--------------------\n"
          );

      /* =============================================
         6. PROMPT
      ============================================= */

      const prompt = `
You are MemoraAI, an AI-powered personal knowledge assistant.

Answer the user's question using ONLY the
retrieved notes provided below.

Rules:

1. Use only information contained in the notes.
2. Do not invent facts.
3. Do not use outside knowledge.
4. If the notes do not contain enough information,
   clearly say so.
5. Combine information from multiple notes when useful.
6. Keep the answer concise, clear, and helpful.
7. Do not mention similarity scores.

USER QUESTION:

${cleanQuestion}

RETRIEVED NOTES:

${context}

Answer using only the retrieved notes.
`;

      /* =============================================
         7. GEMINI
      ============================================= */

      const response =
        await ai.models.generateContent(
          {
            model:
              "gemini-3.6-flash",

            contents:
              prompt,
          }
        );

      const answer =
        response.text?.trim() ||
        "I couldn't generate an answer.";

      /* =============================================
         8. SAVE HISTORY
      ============================================= */

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
          cleanQuestion,
          answer,
        ]
      );

      /* =============================================
         9. RETURN
      ============================================= */

      return res.json({
        answer,

        sources:
          relevantNotes.map(
            (note) => ({
              id:
                note.id,

              title:
                note.title,

              similarity:
                Number(
                  note.similarity.toFixed(
                    4
                  )
                ),
            })
          ),
      });
    } catch (
      error: any
    ) {
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

export default router;
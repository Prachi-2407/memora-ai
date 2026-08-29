import { Router } from "express";

import pool from "../database/postgres";

import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth";

import {
  createEmbedding,
} from "../services/embeddings";

const router = Router();

router.use(requireAuth);

/* =====================================================
   TYPES
===================================================== */

interface NoteRow {
  id: number;
  title: string;
  content: string;
  tags: string;
  favorite: boolean;
  deleted: boolean;
}

/* =====================================================
   SAVE / UPDATE EMBEDDING
===================================================== */

async function saveNoteEmbedding(
  noteId: number,
  userId: number,
  title: string,
  content: string,
  tags: string
) {
  const embeddingText = `
Title: ${title}
Content: ${content}
Tags: ${tags}
`;

  const embedding =
    await createEmbedding(
      embeddingText
    );

  await pool.query(
    `
    INSERT INTO note_embeddings
    (
      note_id,
      user_id,
      embedding,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3::jsonb,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT (note_id)

    DO UPDATE SET
      user_id =
        EXCLUDED.user_id,

      embedding =
        EXCLUDED.embedding,

      updated_at =
        CURRENT_TIMESTAMP
    `,
    [
      noteId,
      userId,
      JSON.stringify(
        embedding
      ),
    ]
  );
}

/* =====================================================
   GET ALL NOTES
===================================================== */

router.get(
  "/",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      const result =
        await pool.query<NoteRow>(
          `
          SELECT
            id,
            title,
            content,
            tags,
            favorite,
            deleted
          FROM notes
          WHERE user_id = $1
          ORDER BY updated_at DESC
          `,
          [
            userId,
          ]
        );

      return res.json(
        result.rows
      );
    } catch (error) {
      console.error(
        "Failed to fetch notes:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch notes",
        });
    }
  }
);

/* =====================================================
   GET ONE NOTE
===================================================== */

router.get(
  "/:id",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      const id =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      if (
        Number.isNaN(id)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid note ID",
          });
      }

      const result =
        await pool.query<NoteRow>(
          `
          SELECT
            id,
            title,
            content,
            tags,
            favorite,
            deleted
          FROM notes
          WHERE id = $1
            AND user_id = $2
          `,
          [
            id,
            userId,
          ]
        );

      const note =
        result.rows[0];

      if (!note) {
        return res
          .status(404)
          .json({
            message:
              "Note not found",
          });
      }

      return res.json(
        note
      );
    } catch (error) {
      console.error(
        "Failed to fetch note:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch note",
        });
    }
  }
);

/* =====================================================
   CREATE NOTE
===================================================== */

router.post(
  "/",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      const {
        title,
        content,
        tags = "",
        favorite = false,
        deleted = false,
      } = req.body;

      /* ================= VALIDATION ================= */

      if (
        typeof title !==
          "string" ||
        !title.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Title is required",
          });
      }

      if (
        typeof content !==
        "string"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Content is required",
          });
      }

      const cleanTitle =
        title.trim();

      const cleanTags =
        typeof tags ===
        "string"
          ? tags
          : "";

      /* ================= INSERT NOTE ================= */

      const result =
        await pool.query<NoteRow>(
          `
          INSERT INTO notes
          (
            user_id,
            title,
            content,
            tags,
            favorite,
            deleted
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )

          RETURNING
            id,
            title,
            content,
            tags,
            favorite,
            deleted
          `,
          [
            userId,
            cleanTitle,
            content,
            cleanTags,
            Boolean(
              favorite
            ),
            Boolean(
              deleted
            ),
          ]
        );

      const note =
        result.rows[0];

      if (!note) {
        throw new Error(
          "Failed to create note"
        );
      }

      /* ================= EMBEDDING ================= */

      try {
        await saveNoteEmbedding(
          note.id,
          userId,
          cleanTitle,
          content,
          cleanTags
        );
      } catch (
        embeddingError
      ) {
        console.error(
          "Failed to create note embedding:",
          embeddingError
        );

        /*
         * Keep the note even if the
         * embedding API fails.
         */
      }

      return res
        .status(201)
        .json(
          note
        );
    } catch (error) {
      console.error(
        "Failed to create note:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to create note",
        });
    }
  }
);

/* =====================================================
   UPDATE NOTE
===================================================== */

router.put(
  "/:id",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      const id =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      if (
        Number.isNaN(id)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid note ID",
          });
      }

      /* ================= GET EXISTING NOTE ================= */

      const existingResult =
        await pool.query<NoteRow>(
          `
          SELECT
            id,
            title,
            content,
            tags,
            favorite,
            deleted
          FROM notes
          WHERE id = $1
            AND user_id = $2
          `,
          [
            id,
            userId,
          ]
        );

      const existing =
        existingResult.rows[0];

      if (!existing) {
        return res
          .status(404)
          .json({
            message:
              "Note not found",
          });
      }

      /* ================= VALUES ================= */

      const title =
        req.body.title ??
        existing.title;

      const content =
        req.body.content ??
        existing.content;

      const tags =
        req.body.tags ??
        existing.tags;

      const favorite =
        req.body.favorite ??
        existing.favorite;

      const deleted =
        req.body.deleted ??
        existing.deleted;

      if (
        typeof title !==
          "string" ||
        !title.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Title is required",
          });
      }

      if (
        typeof content !==
        "string"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Content must be text",
          });
      }

      const cleanTitle =
        title.trim();

      const cleanTags =
        typeof tags ===
        "string"
          ? tags
          : "";

      const semanticContentChanged =
        cleanTitle !==
          existing.title ||
        content !==
          existing.content ||
        cleanTags !==
          existing.tags;

      /* ================= UPDATE ================= */

      const updatedResult =
        await pool.query<NoteRow>(
          `
          UPDATE notes

          SET
            title = $1,
            content = $2,
            tags = $3,
            favorite = $4,
            deleted = $5,
            updated_at =
              CURRENT_TIMESTAMP

          WHERE id = $6
            AND user_id = $7

          RETURNING
            id,
            title,
            content,
            tags,
            favorite,
            deleted
          `,
          [
            cleanTitle,
            content,
            cleanTags,
            Boolean(
              favorite
            ),
            Boolean(
              deleted
            ),
            id,
            userId,
          ]
        );

      const updated =
        updatedResult.rows[0];

      if (!updated) {
        return res
          .status(404)
          .json({
            message:
              "Updated note not found",
          });
      }

      /* ================= UPDATE EMBEDDING ================= */

      if (
        semanticContentChanged
      ) {
        try {
          await saveNoteEmbedding(
            id,
            userId,
            cleanTitle,
            content,
            cleanTags
          );
        } catch (
          embeddingError
        ) {
          console.error(
            "Failed to update note embedding:",
            embeddingError
          );
        }
      }

      return res.json(
        updated
      );
    } catch (error) {
      console.error(
        "Failed to update note:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to update note",
        });
    }
  }
);

/* =====================================================
   DELETE NOTE FOREVER
===================================================== */

router.delete(
  "/:id",
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      const id =
        Number(
          req.params.id
        );

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      if (
        Number.isNaN(id)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid note ID",
          });
      }

      /*
       * note_embeddings will be deleted
       * automatically because PostgreSQL
       * uses ON DELETE CASCADE.
       */

      const result =
        await pool.query(
          `
          DELETE FROM notes
          WHERE id = $1
            AND user_id = $2
          RETURNING id
          `,
          [
            id,
            userId,
          ]
        );

      if (
        result.rowCount ===
        0
      ) {
        return res
          .status(404)
          .json({
            message:
              "Note not found",
          });
      }

      return res.json({
        message:
          "Note deleted successfully",
      });
    } catch (error) {
      console.error(
        "Failed to delete note:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to delete note",
        });
    }
  }
);

export default router;
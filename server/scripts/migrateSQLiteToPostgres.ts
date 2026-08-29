import Database from "better-sqlite3";

import pool from "./database/postgres";

const sqlite = new Database(
  "memoraai.db"
);

interface SQLiteUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface SQLiteNote {
  id: number;
  user_id: number | null;
  title: string;
  content: string;
  tags: string;
  favorite: number;
  deleted: number;
  created_at: string;
  updated_at: string;
}

interface SQLiteInteraction {
  id: number;
  user_id: number | null;
  question: string;
  answer: string;
  created_at: string;
}

interface SQLiteEmbedding {
  id: number;
  note_id: number;
  user_id: number;
  embedding: string;
  created_at: string;
  updated_at: string;
}

async function migrate() {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    console.log(
      "Starting SQLite → PostgreSQL migration..."
    );

    /* ================= USERS ================= */

    const users =
      sqlite
        .prepare(`
          SELECT
            id,
            name,
            email,
            password_hash,
            created_at
          FROM users
          ORDER BY id
        `)
        .all() as SQLiteUser[];

    for (const user of users) {
      await client.query(
        `
        INSERT INTO users
        (
          id,
          name,
          email,
          password_hash,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )

        ON CONFLICT (id)
        DO UPDATE SET
          name =
            EXCLUDED.name,
          email =
            EXCLUDED.email,
          password_hash =
            EXCLUDED.password_hash,
          created_at =
            EXCLUDED.created_at
        `,
        [
          user.id,
          user.name,
          user.email,
          user.password_hash,
          user.created_at,
        ]
      );
    }

    console.log(
      `Migrated ${users.length} users`
    );

    /* ================= NOTES ================= */

    const notes =
      sqlite
        .prepare(`
          SELECT
            id,
            user_id,
            title,
            content,
            tags,
            favorite,
            deleted,
            created_at,
            updated_at
          FROM notes
          ORDER BY id
        `)
        .all() as SQLiteNote[];

    for (const note of notes) {
      if (
        note.user_id === null
      ) {
        console.log(
          `Skipping note ${note.id}: no user_id`
        );

        continue;
      }

      await client.query(
        `
        INSERT INTO notes
        (
          id,
          user_id,
          title,
          content,
          tags,
          favorite,
          deleted,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )

        ON CONFLICT (id)
        DO UPDATE SET
          user_id =
            EXCLUDED.user_id,
          title =
            EXCLUDED.title,
          content =
            EXCLUDED.content,
          tags =
            EXCLUDED.tags,
          favorite =
            EXCLUDED.favorite,
          deleted =
            EXCLUDED.deleted,
          created_at =
            EXCLUDED.created_at,
          updated_at =
            EXCLUDED.updated_at
        `,
        [
          note.id,
          note.user_id,
          note.title,
          note.content,
          note.tags,
          Boolean(
            note.favorite
          ),
          Boolean(
            note.deleted
          ),
          note.created_at,
          note.updated_at,
        ]
      );
    }

    console.log(
      `Processed ${notes.length} notes`
    );

    /* ================= AI INTERACTIONS ================= */

    const interactions =
      sqlite
        .prepare(`
          SELECT
            id,
            user_id,
            question,
            answer,
            created_at
          FROM ai_interactions
          ORDER BY id
        `)
        .all() as SQLiteInteraction[];

    for (
      const interaction
      of interactions
    ) {
      if (
        interaction.user_id ===
        null
      ) {
        console.log(
          `Skipping AI interaction ${interaction.id}: no user_id`
        );

        continue;
      }

      await client.query(
        `
        INSERT INTO ai_interactions
        (
          id,
          user_id,
          question,
          answer,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )

        ON CONFLICT (id)
        DO UPDATE SET
          user_id =
            EXCLUDED.user_id,
          question =
            EXCLUDED.question,
          answer =
            EXCLUDED.answer,
          created_at =
            EXCLUDED.created_at
        `,
        [
          interaction.id,
          interaction.user_id,
          interaction.question,
          interaction.answer,
          interaction.created_at,
        ]
      );
    }

    console.log(
      `Processed ${interactions.length} AI interactions`
    );

    /* ================= EMBEDDINGS ================= */

    const embeddings =
      sqlite
        .prepare(`
          SELECT
            id,
            note_id,
            user_id,
            embedding,
            created_at,
            updated_at
          FROM note_embeddings
          ORDER BY id
        `)
        .all() as SQLiteEmbedding[];

    for (
      const embedding
      of embeddings
    ) {
      let parsedEmbedding:
        number[];

      try {
        parsedEmbedding =
          JSON.parse(
            embedding.embedding
          ) as number[];
      } catch {
        console.log(
          `Skipping embedding ${embedding.id}: invalid JSON`
        );

        continue;
      }

      await client.query(
        `
        INSERT INTO note_embeddings
        (
          id,
          note_id,
          user_id,
          embedding,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4::jsonb,
          $5,
          $6
        )

        ON CONFLICT (note_id)
        DO UPDATE SET
          user_id =
            EXCLUDED.user_id,
          embedding =
            EXCLUDED.embedding,
          created_at =
            EXCLUDED.created_at,
          updated_at =
            EXCLUDED.updated_at
        `,
        [
          embedding.id,
          embedding.note_id,
          embedding.user_id,
          JSON.stringify(
            parsedEmbedding
          ),
          embedding.created_at,
          embedding.updated_at,
        ]
      );
    }

    console.log(
      `Processed ${embeddings.length} embeddings`
    );

    /* ================= RESET POSTGRES SEQUENCES ================= */

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence(
          'users',
          'id'
        ),
        COALESCE(
          (
            SELECT MAX(id)
            FROM users
          ),
          1
        ),
        true
      );
    `);

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence(
          'notes',
          'id'
        ),
        COALESCE(
          (
            SELECT MAX(id)
            FROM notes
          ),
          1
        ),
        true
      );
    `);

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence(
          'ai_interactions',
          'id'
        ),
        COALESCE(
          (
            SELECT MAX(id)
            FROM ai_interactions
          ),
          1
        ),
        true
      );
    `);

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence(
          'note_embeddings',
          'id'
        ),
        COALESCE(
          (
            SELECT MAX(id)
            FROM note_embeddings
          ),
          1
        ),
        true
      );
    `);

    await client.query(
      "COMMIT"
    );

    console.log(
      "Migration complete ✅"
    );
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Migration failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    client.release();

    sqlite.close();

    await pool.end();
  }
}

migrate();
import pool from "./pool";

// Question interface
export interface Question {
  id: string;
  source: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string[];
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  syncAt: string | null;
}

// Initialize database table
export async function initializeDatabase(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(20) PRIMARY KEY,
      source VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]',
      source_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      sync_at TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_questions_question ON questions(question);
  `;
  await pool.query(createTableQuery);
}

export { pool };
export const postgresDb = {
  questions: {
    findMany: async (filter?: {
      where?: {
        category?: string;
        difficulty?: string;
        OR?: Array<{ question?: { contains: string } }>;
      };
      orderBy?: { createdAt?: "desc" };
    }): Promise<Question[]> => {
      const conditions: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (filter?.where?.category) {
        conditions.push(`category = $${paramIndex++}`);
        values.push(filter.where.category);
      }
      if (filter?.where?.difficulty) {
        conditions.push(`difficulty = $${paramIndex++}`);
        values.push(filter.where.difficulty);
      }
      if (filter?.where?.OR) {
        const searchTerms = filter.where.OR.map(
          (or) => or.question?.contains?.toLowerCase()
        ).filter(Boolean);
        if (searchTerms.length > 0) {
          const orConditions = searchTerms.map((term) => {
            const cond = `(LOWER(question) LIKE $${paramIndex++} OR LOWER(answer) LIKE $${paramIndex++})`;
            values.push(`%${term}%`, `%${term}%`);
            return cond;
          });
          conditions.push(`(${orConditions.join(" OR ")})`);
        }
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const orderClause = filter?.orderBy?.createdAt
        ? "ORDER BY created_at DESC"
        : "ORDER BY created_at DESC";

      const query = `SELECT * FROM questions ${whereClause} ${orderClause}`;
      const result = await pool.query(query, values);
      return result.rows.map(mapRowToQuestion);
    },

    findUnique: async (where: { id: string }): Promise<Question | null> => {
      const query = "SELECT * FROM questions WHERE id = $1";
      const result = await pool.query(query, [where.id]);
      return result.rows[0] ? mapRowToQuestion(result.rows[0]) : null;
    },

    create: async (
      data: Omit<Question, "id" | "createdAt" | "updatedAt">
    ): Promise<Question> => {
      const query = `
        INSERT INTO questions (id, source, category, difficulty, question, answer, tags, source_url, created_at, updated_at, sync_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
        RETURNING *
      `;
      const id = generateId();
      const result = await pool.query(query, [
        id,
        data.source,
        data.category,
        data.difficulty,
        data.question,
        data.answer,
        JSON.stringify(data.tags || []),
        data.sourceUrl,
        data.syncAt,
      ]);
      return mapRowToQuestion(result.rows[0]);
    },

    update: async (
      where: { id: string },
      data: Partial<Question>
    ): Promise<Question> => {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (data.source !== undefined) {
        updates.push(`source = $${paramIndex++}`);
        values.push(data.source);
      }
      if (data.category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        values.push(data.category);
      }
      if (data.difficulty !== undefined) {
        updates.push(`difficulty = $${paramIndex++}`);
        values.push(data.difficulty);
      }
      if (data.question !== undefined) {
        updates.push(`question = $${paramIndex++}`);
        values.push(data.question);
      }
      if (data.answer !== undefined) {
        updates.push(`answer = $${paramIndex++}`);
        values.push(data.answer);
      }
      if (data.tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(JSON.stringify(data.tags));
      }
      if (data.sourceUrl !== undefined) {
        updates.push(`source_url = $${paramIndex++}`);
        values.push(data.sourceUrl);
      }
      if (data.syncAt !== undefined) {
        updates.push(`sync_at = $${paramIndex++}`);
        values.push(data.syncAt);
      }

      updates.push(`updated_at = NOW()`);
      values.push(where.id);

      const query = `UPDATE questions SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const result = await pool.query(query, values);
      return mapRowToQuestion(result.rows[0]);
    },

    delete: async (where: { id: string }): Promise<void> => {
      const query = "DELETE FROM questions WHERE id = $1";
      await pool.query(query, [where.id]);
    },

    findFirst: async (where: {
      OR?: Array<{ question?: string; sourceUrl?: string }>;
    }): Promise<Question | null> => {
      if (!where.OR) return null;

      const conditions: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      for (const or of where.OR) {
        if (or.question) {
          conditions.push(`question = $${paramIndex++}`);
          values.push(or.question);
        }
        if (or.sourceUrl) {
          conditions.push(`source_url = $${paramIndex++}`);
          values.push(or.sourceUrl);
        }
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" OR ")}` : "";
      const query = `SELECT * FROM questions ${whereClause} LIMIT 1`;
      const result = await pool.query(query, values);
      return result.rows[0] ? mapRowToQuestion(result.rows[0]) : null;
    },
  },
};

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

function mapRowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    source: row.source as string,
    category: row.category as string,
    difficulty: row.difficulty as string,
    question: row.question as string,
    answer: row.answer as string,
    tags: (typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags) as string[],
    sourceUrl: row.source_url as string | null,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    syncAt: row.sync_at ? (row.sync_at as Date).toISOString() : null,
  };
}

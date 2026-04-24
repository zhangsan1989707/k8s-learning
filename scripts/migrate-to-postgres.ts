import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

interface Question {
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

async function migrate() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://k8s_learning:password@localhost:5432/k8s_learning",
  });

  try {
    // Create table
    console.log("Creating questions table...");
    await pool.query(`
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
    `);

    // Read JSON data
    const dataFile = path.join(process.cwd(), "data", "questions.json");
    console.log(`Reading from ${dataFile}...`);
    const jsonData = fs.readFileSync(dataFile, "utf-8");
    const questions: Question[] = JSON.parse(jsonData);
    console.log(`Found ${questions.length} questions to migrate`);

    // Insert questions
    let inserted = 0;
    let skipped = 0;

    for (const q of questions) {
      try {
        await pool.query(
          `
          INSERT INTO questions (id, source, category, difficulty, question, answer, tags, source_url, created_at, updated_at, sync_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            source = EXCLUDED.source,
            category = EXCLUDED.category,
            difficulty = EXCLUDED.difficulty,
            question = EXCLUDED.question,
            answer = EXCLUDED.answer,
            tags = EXCLUDED.tags,
            source_url = EXCLUDED.source_url,
            updated_at = EXCLUDED.updated_at,
            sync_at = EXCLUDED.sync_at
        `,
          [
            q.id,
            q.source,
            q.category,
            q.difficulty,
            q.question,
            q.answer,
            JSON.stringify(q.tags || []),
            q.sourceUrl,
            q.createdAt,
            q.updatedAt,
            q.syncAt,
          ]
        );
        inserted++;
      } catch (err) {
        console.error(`Error inserting question ${q.id}:`, err);
        skipped++;
      }
    }

    console.log(
      `Migration complete: ${inserted} inserted, ${skipped} skipped`
    );

    // Verify
    const result = await pool.query("SELECT COUNT(*) FROM questions");
    console.log(`Total questions in database: ${result.rows[0].count}`);
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);

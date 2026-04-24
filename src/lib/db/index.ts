import { postgresDb, initializeDatabase } from "./postgres";
import { Question } from "./postgres";

// Re-export the PostgreSQL-backed db
export const db = postgresDb;

// Initialize database table on startup
initializeDatabase().catch(console.error);

// Re-export Question type
export type { Question };

export default db;

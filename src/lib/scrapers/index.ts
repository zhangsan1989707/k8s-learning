import crypto from "crypto";
import db from "@/lib/db";
import { ScrapedQuestion, Scraper } from "./types";
import { githubScraper } from "./github";
import { blogScraper } from "./blogs";

// Simple hash function for deduplication based on question content
function hashQuestion(question: string): string {
  return crypto.createHash("md5").update(question.toLowerCase().trim()).digest("hex");
}

export async function syncAllSources(): Promise<{
  newCount: number;
  updatedCount: number;
  errorCount: number;
}> {
  const scrapers: Scraper[] = [githubScraper, blogScraper];

  let newCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const scraper of scrapers) {
    console.log(`Syncing from ${scraper.name}...`);

    try {
      const questions = await scraper.fetchQuestions();
      console.log(`  Found ${questions.length} questions from ${scraper.name}`);

      for (const q of questions) {
        try {
          // Check if question already exists by question text only
          const existing = await db.questions.findFirst({
            OR: [{ question: q.question }],
          });

          if (existing) {
            // Update if content differs
            if (existing.answer !== q.answer || existing.source === "manual") {
              await db.questions.update(
                { id: existing.id },
                {
                  answer: q.answer,
                  category: q.category,
                  difficulty: q.difficulty,
                  tags: q.tags,
                  syncAt: new Date().toISOString(),
                }
              );
              updatedCount++;
            }
          } else {
            // Create new question
            await db.questions.create({
              source: q.source,
              question: q.question,
              answer: q.answer,
              category: q.category,
              difficulty: q.difficulty,
              tags: q.tags,
              sourceUrl: q.sourceUrl,
              syncAt: new Date().toISOString(),
            });
            newCount++;
          }
        } catch (err) {
          console.error(`  Error processing question:`, err);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`Error syncing from ${scraper.name}:`, err);
      errorCount++;
    }
  }

  return { newCount, updatedCount, errorCount };
}

export { githubScraper, blogScraper };
export type { ScrapedQuestion, Scraper };

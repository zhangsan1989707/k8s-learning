import axios from "axios";
import * as cheerio from "cheerio";
import { Scraper, ScrapedQuestion } from "./types";

// 更可靠的中文 K8s 面试题博客
const BLOG_SOURCES = [
  {
    name: "Kubernetes 面试题",
    url: "https://www.cnblogs.com/tengkongzhi/p/15155536.html",
    category: "Kubernetes",
  },
];

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\n\r]+/g, "\n")
    .trim();
}

function extractQuestionsFromHtml(html: string, sourceUrl: string): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = [];
  const $ = cheerio.load(html);

  // 尝试多种选择器模式
  // 模式1: h3 包含 Q: 然后 p 包含 A:
  $("h1, h2, h3, h4").each((_, el) => {
    const questionText = $(el).text();
    if (questionText.match(/Q[.:：]|问题|面试题/i)) {
      let answerText = "";
      let nextEl = $(el).next();

      while (nextEl.length && !["h1", "h2", "h3", "h4"].includes(nextEl[0].tagName)) {
        const tagName = nextEl[0].tagName;
        if (tagName === "p" || tagName === "div") {
          const text = nextEl.text().trim();
          if (text && !text.match(/^Q[.:：]|^A[.:：]/i)) {
            answerText += text + "\n";
          }
        }
        nextEl = nextEl.next();
      }

      if (questionText.length > 10 && answerText.length > 10) {
        questions.push({
          question: cleanText(questionText.replace(/Q[.:：]\s*/i, "")),
          answer: cleanText(answerText),
          category: "Kubernetes",
          difficulty: "中级",
          tags: ["kubernetes", "blog"],
          sourceUrl,
          source: "blog",
        });
      }
    }
  });

  return questions;
}

export async function fetchBlogQuestions(): Promise<ScrapedQuestion[]> {
  const allQuestions: ScrapedQuestion[] = [];

  for (const source of BLOG_SOURCES) {
    try {
      const response = await axios.get(source.url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const questions = extractQuestionsFromHtml(response.data, source.url);

      if (questions.length > 0) {
        allQuestions.push(...questions);
        console.log(`Fetched ${questions.length} questions from ${source.name}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  return allQuestions;
}

export const blogScraper: Scraper = {
  name: "K8s Interview Blogs",
  fetchQuestions: fetchBlogQuestions,
};

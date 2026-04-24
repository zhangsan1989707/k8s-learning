import axios from "axios";
import { Scraper, ScrapedQuestion } from "./types";

// devops-exercises 仓库的 Kubernetes 面试题
const K8S_QUESTIONS_URL =
  "https://raw.githubusercontent.com/bregman-arie/devops-exercises/master/topics/kubernetes/README.md";

function cleanText(text: string): string {
  return text
    .replace(/\n+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function parseQuestions(content: string): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = [];
  const lines = content.split("\n");

  let currentQuestion = "";
  let currentAnswer = "";
  let inAnswer = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match Q: or Q followed by question
    const qMatch = trimmed.match(/^Q[:\s]*(.+)/i);
    if (qMatch) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        questions.push({
          question: cleanText(currentQuestion),
          answer: cleanText(currentAnswer),
          category: "Kubernetes",
          difficulty: "中级",
          tags: ["kubernetes", "devops-exercises"],
          sourceUrl: "https://github.com/bregman-arie/devops-exercises",
          source: "github",
        });
      }
      currentQuestion = qMatch[1];
      currentAnswer = "";
      inAnswer = true;
      continue;
    }

    // Match A: or A followed by answer
    const aMatch = trimmed.match(/^A[:\s]*(.+)/i);
    if (aMatch) {
      currentAnswer = aMatch[1];
      inAnswer = true;
      continue;
    }

    // Continue building answer
    if (inAnswer && trimmed && !trimmed.startsWith("#")) {
      currentAnswer += "\n" + trimmed;
    }
  }

  // Don't forget the last Q&A
  if (currentQuestion && currentAnswer) {
    questions.push({
      question: cleanText(currentQuestion),
      answer: cleanText(currentAnswer),
      category: "Kubernetes",
      difficulty: "中级",
      tags: ["kubernetes", "devops-exercises"],
      sourceUrl: "https://github.com/bregman-arie/devops-exercises",
      source: "github",
    });
  }

  return questions;
}

export async function fetchGitHubQuestions(): Promise<ScrapedQuestion[]> {
  try {
    const response = await axios.get(K8S_QUESTIONS_URL, {
      timeout: 15000,
      headers: {
        "User-Agent": "K8s-Learning/1.0",
      },
    });

    const questions = parseQuestions(response.data);

    // Filter out questions that are too short
    return questions.filter(
      (q) => q.question.length > 15 && q.answer.length > 10
    );
  } catch (error) {
    console.error("Error fetching from devops-exercises:", error);
    return [];
  }
}

export const githubScraper: Scraper = {
  name: "devops-exercises Kubernetes Questions",
  fetchQuestions: fetchGitHubQuestions,
};

import { Scraper, ScrapedQuestion } from "./types";
import { execSync } from "child_process";

// Devinterview-io 英文数据源
const DEVINTERVIEW_URL =
  "https://raw.githubusercontent.com/Devinterview-io/kubernetes-interview-questions/main/README.md";

// CSView 中文数据源
const CSVIEW_URL =
  "https://raw.githubusercontent.com/zijing2333/CSView/main/src/k8s/README.md";

function fetchWithCurl(url: string): string {
  try {
    return execSync(`curl -sL --max-time 30 "${url}"`, {
      encoding: "utf-8",
      timeout: 35000,
    });
  } catch (error) {
    console.error("curl fetch error:", error);
    return "";
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\n+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDevInterviewQuestions(content: string): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = [];

  // 按 ## 数字. 标题分割
  const sections = content.split(/^##\s+\d+\.\s+/m);

  for (const section of sections) {
    if (!section.trim()) continue;

    const lines = section.split("\n");
    const titleLine = lines[0].trim();
    if (!titleLine) continue;

    // Skip header lines (lines starting with # but not ## question numbers)
    if (titleLine.startsWith("# ") || titleLine.startsWith("# 42")) continue;

    const question = cleanText(titleLine.replace(/\*\*/g, "").replace(/"/g, ""));
    const answerContent = lines.slice(1).join("\n").trim();
    const answer = cleanText(answerContent.replace(/^#+\s*/gm, "").replace(/\*\*/g, ""));

    if (question.length > 15 && answer.length > 50) {
      let difficulty = "中级";
      const lowerQ = question.toLowerCase();
      if (lowerQ.includes("advanced") || lowerQ.includes("expert") || lowerQ.includes("master")) {
        difficulty = "高级";
      } else if (lowerQ.includes("basic") || lowerQ.includes("what is")) {
        difficulty = "初级";
      }

      let category = "Kubernetes";
      if (lowerQ.includes("pod") || lowerQ.includes("container")) category = "基础概念";
      else if (lowerQ.includes("service") || lowerQ.includes("network") || lowerQ.includes("ingress")) category = "网络";
      else if (lowerQ.includes("deploy") || lowerQ.includes("stateful")) category = "架构组件";
      else if (lowerQ.includes("storage") || lowerQ.includes("volume")) category = "存储";
      else if (lowerQ.includes("security") || lowerQ.includes("rbac") || lowerQ.includes("secret")) category = "安全";

      questions.push({
        question,
        answer,
        category,
        difficulty,
        tags: ["kubernetes", "interview"],
        sourceUrl: "https://github.com/Devinterview-io/kubernetes-interview-questions",
        source: "github",
      });
    }
  }

  return questions;
}

function parseCSViewQuestions(content: string): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = [];

  // 按 ### 标题分割（中文面试题格式）
  const sections = content.split(/^###\s+/m);

  for (const section of sections) {
    if (!section.trim() || section.startsWith("K8S") || section.startsWith("title:")) continue;

    const lines = section.split("\n");
    const titleLine = lines[0].trim();
    if (!titleLine) continue;

    const question = cleanText(titleLine);
    const answerContent = lines.slice(1).join("\n").trim();
    const answer = cleanText(answerContent.replace(/^#+\s*/gm, "").replace(/\*\*/g, "").replace(/^-/gm, "\n-"));

    if (question.length > 5 && answer.length > 20) {
      let difficulty = "中级";
      const lowerQ = question.toLowerCase();

      // 判断难度
      if (lowerQ.includes("高级") || lowerQ.includes("深入") || lowerQ.includes("原理")) {
        difficulty = "高级";
      } else if (lowerQ.includes("基础") || lowerQ.includes("介绍") || lowerQ.includes("什么是")) {
        difficulty = "初级";
      }

      // 判断分类
      let category = "Kubernetes";
      if (lowerQ.includes("pod") || lowerQ.includes("容器") || lowerQ.includes("docker")) category = "基础概念";
      else if (lowerQ.includes("service") || lowerQ.includes("网络") || lowerQ.includes("ingress")) category = "网络";
      else if (lowerQ.includes("存储") || lowerQ.includes("volume") || lowerQ.includes("pv")) category = "存储";
      else if (lowerQ.includes("安全") || lowerQ.includes("rbac") || lowerQ.includes("secret")) category = "安全";
      else if (lowerQ.includes("调度") || lowerQ.includes("scheduler")) category = "架构组件";
      else if (lowerQ.includes("部署") || lowerQ.includes("集群")) category = "架构组件";

      questions.push({
        question,
        answer,
        category,
        difficulty,
        tags: ["kubernetes", "csview"],
        sourceUrl: "https://github.com/zijing2333/CSView",
        source: "github",
      });
    }
  }

  return questions;
}

export async function fetchGitHubQuestions(): Promise<ScrapedQuestion[]> {
  const allQuestions: ScrapedQuestion[] = [];

  // 获取英文面试题
  console.log("Fetching from Devinterview-io...");
  const devContent = fetchWithCurl(DEVINTERVIEW_URL);
  if (devContent) {
    const devQuestions = parseDevInterviewQuestions(devContent);
    console.log(`  Found ${devQuestions.length} English questions`);
    allQuestions.push(...devQuestions);
  }

  // 获取中文面试题
  console.log("Fetching from CSView...");
  const csContent = fetchWithCurl(CSVIEW_URL);
  if (csContent) {
    const csQuestions = parseCSViewQuestions(csContent);
    console.log(`  Found ${csQuestions.length} Chinese questions`);
    allQuestions.push(...csQuestions);
  }

  console.log(`Total questions fetched: ${allQuestions.length}`);
  return allQuestions;
}

export const githubScraper: Scraper = {
  name: "GitHub K8s Interview Questions",
  fetchQuestions: fetchGitHubQuestions,
};

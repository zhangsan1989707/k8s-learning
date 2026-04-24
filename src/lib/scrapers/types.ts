export interface ScrapedQuestion {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  tags: string[];
  sourceUrl: string;
  source: string;
}

export interface Scraper {
  name: string;
  fetchQuestions: () => Promise<ScrapedQuestion[]>;
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface Question {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string[];
  sourceUrl: string | null;
  source: string;
}

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("全部");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/questions?";
      const params = new URLSearchParams();

      if (selectedCategory !== "全部") {
        params.append("category", selectedCategory);
      }
      if (selectedDifficulty !== "全部") {
        params.append("difficulty", selectedDifficulty);
      }

      url += params.toString();

      const response = await fetch(url);
      if (!response.ok) throw new Error("获取数据失败");

      const data = await response.json();
      setQuestions(data.questions || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/sync", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        alert(result.message);
        fetchQuestions();
      } else {
        alert("同步失败: " + result.error);
      }
    } catch (err) {
      alert("同步失败: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const difficulties = ["初级", "中级", "高级"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Kubernetes 面试题</h1>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSyncing ? "同步中..." : "🔄 同步数据"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {error}
          <button
            onClick={fetchQuestions}
            className="ml-4 underline hover:no-underline"
          >
            重试
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="全部">全部分类</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="全部">全部难度</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          加载中...
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无面试题数据</p>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSyncing ? "同步中..." : "点击同步数据"}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        q.difficulty === "初级"
                          ? "bg-green-100 text-green-700"
                          : q.difficulty === "中级"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-sm text-muted-foreground">{q.category}</span>
                    {q.source && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {q.source}
                      </span>
                    )}
                  </div>
                  <span>{expandedId === q.id ? "−" : "+"}</span>
                </button>
                {expandedId === q.id && (
                  <div className="p-4 border-t bg-muted/50">
                    <p className="font-medium mb-3">{q.question}</p>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{q.answer}</pre>
                    {q.sourceUrl && (
                      <a
                        href={q.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 text-xs text-blue-600 hover:underline block"
                      >
                        来源: {q.sourceUrl}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-muted-foreground">
            共 {questions.length} 道面试题
          </div>
        </>
      )}
    </div>
  );
}

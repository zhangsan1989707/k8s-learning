"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  beginnerTutorials,
  intermediateTutorials,
  advancedTutorials,
  type Tutorial,
} from "@/lib/tutorials/curriculum";

const tutorialMap: Record<string, Tutorial[]> = {
  beginner: beginnerTutorials,
  intermediate: intermediateTutorials,
  advanced: advancedTutorials,
};

const levelNames: Record<string, string> = {
  beginner: "初学者",
  intermediate: "进阶",
  advanced: "高级",
};

export default function TutorialPage() {
  const params = useParams();
  const level = params.level as string;
  const tutorialId = params.tutorialId as string;
  const [currentSection, setCurrentSection] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const tutorials = tutorialMap[level] || [];
  const tutorial = tutorials.find((t) => t.id === tutorialId);

  if (!tutorial) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">教程未找到</h1>
        <Link href={`/learn/${level}`} className="text-primary hover:underline">
          返回学习路径
        </Link>
      </div>
    );
  }

  const section = tutorial.sections[currentSection];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href={`/learn/${level}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← 返回 {levelNames[level] || level} 路径
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
            <p className="text-muted-foreground">{tutorial.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 border-b overflow-x-auto">
              {tutorial.sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSection(i);
                    setShowAnswer(false);
                  }}
                  className={`px-4 py-2 text-sm whitespace-nowrap ${
                    currentSection === i
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>

            {section.type === "text" && (
              <div className="whitespace-pre-wrap text-muted-foreground">
                {section.content}
              </div>
            )}

            {section.type === "code" && (
              <div>
                <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>{section.content}</code>
                </pre>
              </div>
            )}

            {section.type === "exercise" && (
              <div className="space-y-4">
                <p className="text-muted-foreground">{section.content}</p>

                {section.code && (
                  <div>
                    <p className="text-sm font-medium mb-2">参考代码：</p>
                    <pre className="bg-neutral-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <code>{section.code}</code>
                    </pre>
                  </div>
                )}

                {section.hint && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>提示：</strong> {section.hint}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  {showAnswer ? "隐藏答案" : "查看答案"}
                </button>

                {showAnswer && section.expectedResult && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>预期结果：</strong> {section.expectedResult}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => {
                if (currentSection > 0) {
                  setCurrentSection(currentSection - 1);
                  setShowAnswer(false);
                }
              }}
              disabled={currentSection === 0}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              上一节
            </button>
            <button
              onClick={() => {
                if (currentSection < tutorial.sections.length - 1) {
                  setCurrentSection(currentSection + 1);
                  setShowAnswer(false);
                }
              }}
              disabled={currentSection === tutorial.sections.length - 1}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              下一节
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-4 border rounded-lg p-4">
            <h3 className="font-semibold mb-4">教程目录</h3>
            <ul className="space-y-2">
              {tutorial.sections.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      setCurrentSection(i);
                      setShowAnswer(false);
                    }}
                    className={`text-sm text-left w-full ${
                      currentSection === i
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {i + 1}. {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

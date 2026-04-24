import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (category && category !== "全部") {
      where.category = category;
    }

    if (difficulty && difficulty !== "全部") {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [{ question: { contains: search } }];
    }

    const questions = await db.questions.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Get unique categories
    const allQuestions = await db.questions.findMany({});
    const categories = [...new Set(allQuestions.map((q) => q.category))];

    return NextResponse.json({
      questions,
      categories,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, difficulty, question, answer, tags, sourceUrl } = body;

    if (!category || !difficulty || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newQuestion = await db.questions.create({
      source: "manual",
      category,
      difficulty,
      question,
      answer,
      tags: tags || [],
      sourceUrl,
      syncAt: null,
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

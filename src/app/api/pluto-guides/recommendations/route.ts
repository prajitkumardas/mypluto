import { NextResponse } from "next/server";
import { getGuideRecommendations } from "@/lib/pluto-guides-recommendations";
import { guideGoals, guideBudgets, type GuideAnswers } from "@/lib/pluto-guides-options";

export async function POST(request: Request) {
  let answers: GuideAnswers;

  try {
    answers = (await request.json()) as GuideAnswers;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const goal = guideGoals.find((item) => item.id === answers.goal);
  const task = goal?.tasks.find((item) => item.id === answers.primaryTask);
  const budget = guideBudgets.find((item) => item.id === answers.budget);

  if (!goal || !task || !budget) {
    return NextResponse.json({ error: "Goal, task, and budget are required" }, { status: 400 });
  }

  return NextResponse.json({ recommendations: getGuideRecommendations(answers) });
}

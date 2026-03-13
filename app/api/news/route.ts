import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsImpact } from "@/lib/newsAnalysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text ?? "";
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "News text is required" }, { status: 400 });
    }
    const result = await analyzeNewsImpact(text.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error("News analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze news" }, { status: 500 });
  }
}

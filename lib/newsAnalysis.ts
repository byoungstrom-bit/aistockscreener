/**
 * News Impact Interpretation
 *
 * Analyzes news text for: sentiment, materiality, event type, potential investor reaction.
 * Does NOT predict stock prices. Framed as interpretation, not prediction.
 *
 * With OPENAI_API_KEY: can call LLM (future).
 * Without: uses deterministic keyword-based mock analysis.
 */

import {
  NewsAnalysisResult,
  NewsSentiment,
  NewsMateriality,
  NewsEventType,
  InvestorReaction,
} from "./types";

// Sentiment keywords (deterministic, no prediction)
const BULLISH_PHRASES = [
  "beat", "surge", "rally", "growth", "profit", "gain", "upgrade", "strong",
  "record", "exceed", "outperform", "buy", "bullish", "recovery", "expansion",
  "raise", "raised", "positive", "optimistic",
];
const BEARISH_PHRASES = [
  "miss", "decline", "fall", "loss", "cut", "downgrade", "weak", "concern",
  "warning", "sell", "bearish", "recession", "layoff", "bankruptcy", "default",
  "lower", "lowered", "negative", "pessimistic",
];

// Event type detection
const EVENT_PATTERNS: Array<{ type: NewsEventType; patterns: string[] }> = [
  { type: "Earnings", patterns: ["earnings", "quarterly", "revenue", "eps", "guidance", "beat", "miss"] },
  { type: "Regulatory", patterns: ["fda", "sec", "regulatory", "approval", "lawsuit", "investigation"] },
  { type: "Macro", patterns: ["fed", "interest rate", "inflation", "recession", "economy", "gdp"] },
  { type: "Product/Strategy", patterns: ["product", "launch", "partnership", "expansion", "acquisition"] },
  { type: "Management", patterns: ["ceo", "cfo", "resign", "appoint", "executive"] },
  { type: "M&A", patterns: ["merger", "acquisition", "buyout", "takeover", "deal"] },
];

// Materiality: high-impact words
const HIGH_MATERIALITY = ["earnings", "revenue", "guidance", "acquisition", "bankruptcy", "sec", "fda"];
const LOW_MATERIALITY = ["analyst", "rating", "price target", "upgrade", "downgrade"];

export async function analyzeNewsImpact(text: string): Promise<NewsAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey?.trim()) {
    return mockAnalyzeNews(text);
  }

  // Future: call OpenAI for richer analysis
  // return await callOpenAIForNewsAnalysis(text, apiKey);
  return mockAnalyzeNews(text);
}

function mockAnalyzeNews(text: string): NewsAnalysisResult {
  const lower = text.toLowerCase();

  // Sentiment
  let bullishCount = 0;
  let bearishCount = 0;
  for (const w of BULLISH_PHRASES) {
    if (lower.includes(w)) bullishCount++;
  }
  for (const w of BEARISH_PHRASES) {
    if (lower.includes(w)) bearishCount++;
  }
  const sentiment = getSentiment(bullishCount, bearishCount);

  // Materiality
  const materiality = getMateriality(lower);

  // Event type
  const eventType = getEventType(lower);

  // Investor reaction (interpretation of likely reaction, not price prediction)
  const investorReaction = getInvestorReaction(sentiment, materiality, eventType);

  // Reasoning
  const reasoning = buildReasoning(sentiment, materiality, eventType, investorReaction);

  return {
    sentiment,
    materiality,
    eventType,
    investorReaction,
    reasoning,
  };
}

function getSentiment(bullish: number, bearish: number): NewsSentiment {
  const diff = bullish - bearish;
  if (diff >= 2) return "Bullish";
  if (diff <= -2) return "Bearish";
  return "Neutral";
}

function getMateriality(lower: string): NewsMateriality {
  const highCount = HIGH_MATERIALITY.filter((w) => lower.includes(w)).length;
  const lowCount = LOW_MATERIALITY.filter((w) => lower.includes(w)).length;
  if (highCount >= 2) return "High";
  if (highCount >= 1 || lowCount === 0) return "Medium";
  return "Low";
}

function getEventType(lower: string): NewsEventType {
  let best: NewsEventType = "Other";
  let bestCount = 0;
  for (const { type, patterns } of EVENT_PATTERNS) {
    const count = patterns.filter((p) => lower.includes(p)).length;
    if (count > bestCount) {
      bestCount = count;
      best = type;
    }
  }
  return best;
}

function getInvestorReaction(
  sentiment: NewsSentiment,
  materiality: NewsMateriality,
  eventType: NewsEventType
): InvestorReaction {
  if (materiality === "Low") return "Uncertain";
  if (sentiment === "Bullish" && (materiality === "High" || eventType === "Earnings"))
    return "Likely positive";
  if (sentiment === "Bearish" && (materiality === "High" || eventType === "Earnings"))
    return "Likely negative";
  if (sentiment === "Neutral") return "Mixed";
  return sentiment === "Bullish" ? "Likely positive" : sentiment === "Bearish" ? "Likely negative" : "Mixed";
}

function buildReasoning(
  sentiment: NewsSentiment,
  materiality: NewsMateriality,
  eventType: NewsEventType,
  investorReaction: InvestorReaction
): string {
  const parts: string[] = [];
  parts.push(`Sentiment leans ${sentiment.toLowerCase()}.`);
  parts.push(`Materiality appears ${materiality.toLowerCase()}.`);
  parts.push(`Event type: ${eventType}.`);
  parts.push(`Interpreted investor reaction: ${investorReaction.toLowerCase()}.`);
  parts.push("This is an interpretation of news tone and content, not a price prediction.");
  return parts.join(" ");
}

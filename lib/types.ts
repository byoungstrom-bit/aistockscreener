// ─── Stock Data ─────────────────────────────────────────────────────────────

export interface StockData {
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: number;
  beta: number;
  volatility: number;
  priceChange1M: number;
  priceChange3M: number;
  profitMargin?: number;
  roe?: number;
  debtToEquity?: number;
  currentRatio?: number;
  news: NewsItem[];
}

export interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
}

// ─── Risk Scoring ───────────────────────────────────────────────────────────

export type RiskTier = "Low" | "Moderate" | "High" | "Speculative";

export interface FactorScore {
  value: number | string;
  score: number;
  weight: number;
  contribution: number; // score * weight, this factor's share of final score
  explanation: string; // human-readable rationale
}

export interface ScoreBreakdown {
  beta: FactorScore;
  volatility: FactorScore;
  marketCap: FactorScore;
  profitability: FactorScore;
  debt: FactorScore;
  momentum: FactorScore;
  sectorRisk: FactorScore;
}

export interface RiskScore {
  score: number;
  tier: RiskTier;
  breakdown: ScoreBreakdown;
}

// ─── Position Sizing ───────────────────────────────────────────────────────

export type RiskProfile = "Conservative" | "Moderate" | "Aggressive";

export interface PositionSizing {
  minAllocation: number;
  maxAllocation: number;
  rangeLabel: string;
  caveat: string;
}

// ─── Risk Explanation ──────────────────────────────────────────────────────

export interface RiskExplanation {
  summary: string;
  topRiskDrivers: string[];
  improvingFactors: string[];
  worseningFactors: string[];
}

// ─── News Analysis ──────────────────────────────────────────────────────────

export type NewsSentiment = "Bullish" | "Neutral" | "Bearish";
export type NewsMateriality = "High" | "Medium" | "Low";
export type NewsEventType =
  | "Earnings"
  | "Regulatory"
  | "Macro"
  | "Product/Strategy"
  | "Management"
  | "M&A"
  | "Other";
export type InvestorReaction = "Likely positive" | "Mixed" | "Likely negative" | "Uncertain";

export interface NewsAnalysisResult {
  sentiment: NewsSentiment;
  materiality: NewsMateriality;
  eventType: NewsEventType;
  investorReaction: InvestorReaction;
  reasoning: string;
}

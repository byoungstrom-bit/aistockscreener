/**
 * Risk Scoring Engine
 *
 * Transparent, rule-based scoring. Each factor contributes to a 1–10 risk score
 * (higher = riskier). Formula: weighted sum of factor scores.
 *
 * Weights sum to 1.0. Contribution = factor_score × weight.
 * Final score = sum of all contributions, clamped to [1, 10].
 */

import { StockData, RiskScore, RiskTier, ScoreBreakdown, FactorScore } from "./types";

// ─── Sector Risk (1–10, higher = riskier) ────────────────────────────────────
// Based on historical volatility and cyclicality of sectors
const SECTOR_RISK_SCORES: Record<string, number> = {
  Technology: 6,
  Healthcare: 5,
  Financial: 6,
  Consumer: 4,
  Energy: 7,
  Industrial: 5,
  Utilities: 3,
  "Real Estate": 6,
  Materials: 6,
  "Basic Materials": 6,
  "Consumer Cyclical": 7,
  "Consumer Defensive": 3,
  Communication: 5,
  "Communication Services": 5,
  Unknown: 5,
};

const WEIGHTS = {
  beta: 0.2,
  volatility: 0.2,
  marketCap: 0.15,
  profitability: 0.15,
  debt: 0.1,
  momentum: 0.1,
  sectorRisk: 0.1,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Beta: market sensitivity. <0.8 defensive, 0.8–1.2 market-like, >1.2 aggressive
function scoreBeta(beta: number): { score: number; explanation: string } {
  let score: number;
  let explanation: string;
  if (beta < 0.8) {
    score = clamp(1 + (0.8 - beta) * 2.5, 1, 3);
    explanation = `Beta ${beta.toFixed(2)} indicates lower-than-market sensitivity`;
  } else if (beta <= 1.2) {
    score = 4 + (beta - 0.8) * 5;
    explanation = `Beta ${beta.toFixed(2)} is in line with market`;
  } else {
    score = clamp(6 + (beta - 1.2) * 10, 7, 10);
    explanation = `Beta ${beta.toFixed(2)} indicates high market sensitivity`;
  }
  return { score, explanation };
}

// Volatility: annualized. 15% low, 25% moderate, 40%+ high
function scoreVolatility(volatility: number): { score: number; explanation: string } {
  const score = clamp(volatility * 20, 1, 10);
  const pct = (volatility * 100).toFixed(1);
  return { score, explanation: `${pct}% annualized volatility` };
}

// Market cap: larger = lower risk (liquidity, stability)
function scoreMarketCap(marketCap: number): { score: number; explanation: string } {
  const billions = marketCap / 1e9;
  let score: number;
  let tier: string;
  if (billions >= 200) {
    score = 1;
    tier = "mega-cap";
  } else if (billions >= 50) {
    score = 2;
    tier = "large-cap";
  } else if (billions >= 10) {
    score = 3;
    tier = "mid-cap";
  } else if (billions >= 2) {
    score = 5;
    tier = "small-cap";
  } else if (billions >= 0.5) {
    score = 7;
    tier = "micro-cap";
  } else {
    score = 9;
    tier = "nano-cap";
  }
  const fmt = billions >= 1 ? `${billions.toFixed(1)}B` : `${(marketCap / 1e6).toFixed(0)}M`;
  return { score, explanation: `$${fmt} market cap (${tier})` };
}

// Profitability: margins and ROE. Negative or low = higher risk
function scoreProfitability(
  profitMargin?: number,
  roe?: number
): { score: number; explanation: string } {
  const margin = (profitMargin ?? 0) * 100;
  const returnOnEquity = (roe ?? 0) * 100;
  const avg = margin && returnOnEquity ? (margin + returnOnEquity) / 2 : margin || returnOnEquity;
  let score: number;
  let explanation: string;
  if (avg <= 0) {
    score = 9;
    explanation = "Negative or absent profitability metrics";
  } else if (avg < 5) {
    score = 7;
    explanation = `Low profitability (avg ${avg.toFixed(1)}%)`;
  } else if (avg < 10) {
    score = 5;
    explanation = `Moderate profitability (avg ${avg.toFixed(1)}%)`;
  } else if (avg < 15) {
    score = 3;
    explanation = `Solid profitability (avg ${avg.toFixed(1)}%)`;
  } else {
    score = 1;
    explanation = `Strong profitability (avg ${avg.toFixed(1)}%)`;
  }
  return { score, explanation };
}

// Debt: D/E and current ratio. High leverage or weak liquidity = higher risk
function scoreDebt(
  debtToEquity?: number,
  currentRatio?: number
): { score: number; explanation: string } {
  const dte = debtToEquity ?? 1;
  const cr = currentRatio ?? 1;
  let score: number;
  let explanation: string;
  if (dte > 2 || cr < 1) {
    score = 8;
    explanation = `High leverage (D/E ${dte.toFixed(1)}) or weak liquidity (CR ${cr.toFixed(1)})`;
  } else if (dte > 1 || cr < 1.2) {
    score = 6;
    explanation = `Elevated leverage or modest liquidity`;
  } else if (dte > 0.5) {
    score = 4;
    explanation = `Moderate debt levels`;
  } else {
    score = 2;
    explanation = `Conservative balance sheet`;
  }
  return { score, explanation };
}

// Momentum: recent price trend. Negative = higher risk
function scoreMomentum(
  priceChange1M: number,
  priceChange3M: number
): { score: number; explanation: string } {
  const avg = (priceChange1M + priceChange3M) / 2;
  const pct = (avg * 100).toFixed(1);
  let score: number;
  let explanation: string;
  if (avg < -0.2) {
    score = 9;
    explanation = `Strong negative momentum (${pct}% avg)`;
  } else if (avg < -0.1) {
    score = 7;
    explanation = `Negative momentum (${pct}% avg)`;
  } else if (avg < 0) {
    score = 5;
    explanation = `Slight negative momentum (${pct}% avg)`;
  } else if (avg < 0.1) {
    score = 3;
    explanation = `Modest positive momentum (${pct}% avg)`;
  } else {
    score = 1;
    explanation = `Positive momentum (${pct}% avg)`;
  }
  return { score, explanation };
}

function getSectorScore(sector: string): { score: number; explanation: string } {
  const score = SECTOR_RISK_SCORES[sector] ?? 5;
  return { score, explanation: `${sector} sector risk characteristics` };
}

export function calculateRiskScore(data: StockData): RiskScore {
  const betaRes = scoreBeta(data.beta);
  const volRes = scoreVolatility(data.volatility);
  const capRes = scoreMarketCap(data.marketCap);
  const profRes = scoreProfitability(data.profitMargin, data.roe);
  const debtRes = scoreDebt(data.debtToEquity, data.currentRatio);
  const momRes = scoreMomentum(data.priceChange1M, data.priceChange3M);
  const sectorRes = getSectorScore(data.sector);

  const toFactor = (
    key: keyof typeof WEIGHTS,
    value: number | string,
    res: { score: number; explanation: string }
  ): FactorScore => ({
    value,
    score: res.score,
    weight: WEIGHTS[key],
    contribution: res.score * WEIGHTS[key],
    explanation: res.explanation,
  });

  const breakdown: ScoreBreakdown = {
    beta: toFactor("beta", data.beta, betaRes),
    volatility: toFactor("volatility", data.volatility, volRes),
    marketCap: toFactor("marketCap", data.marketCap, capRes),
    profitability: toFactor(
      "profitability",
      data.profitMargin ?? data.roe ?? 0,
      profRes
    ),
    debt: toFactor("debt", data.debtToEquity ?? 0, debtRes),
    momentum: toFactor(
      "momentum",
      (data.priceChange1M + data.priceChange3M) / 2,
      momRes
    ),
    sectorRisk: toFactor("sectorRisk", data.sector, sectorRes),
  };

  const weightedScore = Object.values(breakdown).reduce(
    (sum, f) => sum + f.contribution,
    0
  );
  const normalizedScore = clamp(Math.round(weightedScore * 10) / 10, 1, 10);
  const tier = scoreToTier(normalizedScore);

  return { score: normalizedScore, tier, breakdown };
}

function scoreToTier(score: number): RiskTier {
  if (score <= 2.5) return "Low";
  if (score <= 5) return "Moderate";
  if (score <= 7.5) return "High";
  return "Speculative";
}

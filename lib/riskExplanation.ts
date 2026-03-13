import { StockData, RiskScore, RiskExplanation, ScoreBreakdown } from "./types";

export function generateRiskExplanation(
  data: StockData,
  riskScore: RiskScore
): RiskExplanation {
  const drivers = getTopRiskDrivers(riskScore.breakdown);
  const improving = getImprovingFactors(riskScore.breakdown);
  const worsening = getWorseningFactors(riskScore.breakdown);
  const summary = getSummary(data, riskScore, drivers);

  return {
    summary,
    topRiskDrivers: drivers,
    improvingFactors: improving,
    worseningFactors: worsening,
  };
}

function getSummary(data: StockData, riskScore: RiskScore, drivers: string[]): string {
  const primary = drivers[0] || "multiple factors";
  return `${data.companyName} (${data.ticker}) has a ${riskScore.tier.toLowerCase()} risk profile with a score of ${riskScore.score.toFixed(1)}/10. The primary risk driver is ${primary}. This assessment is based on beta, volatility, market cap, profitability, debt levels, momentum, and sector characteristics.`;
}

function getTopRiskDrivers(breakdown: ScoreBreakdown): string[] {
  const entries = Object.entries(breakdown).map(([key, item]) => ({
    key,
    contribution: item.contribution,
    explanation: item.explanation,
  }));
  return entries
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((e) => e.explanation);
}

function getImprovingFactors(breakdown: ScoreBreakdown): string[] {
  const factors: string[] = [];
  if (breakdown.beta.score > 5) factors.push("Lower beta through reduced leverage or diversified revenue");
  if (breakdown.volatility.score > 5) factors.push("Reduced volatility as company matures or earnings stabilize");
  if (breakdown.marketCap.score > 4) factors.push("Market cap growth would improve liquidity and reduce small-cap risk");
  if (breakdown.profitability.score > 4) factors.push("Improved profit margins and return on equity");
  if (breakdown.debt.score > 4) factors.push("Debt reduction and stronger current ratio");
  if (breakdown.momentum.score > 5) factors.push("Positive price momentum and sentiment improvement");
  if (breakdown.sectorRisk.score > 5) factors.push("Sector rotation toward lower-risk industries");
  if (factors.length === 0) factors.push("Risk profile is already relatively favorable");
  return factors.slice(0, 4);
}

function getWorseningFactors(breakdown: ScoreBreakdown): string[] {
  const factors: string[] = [];
  if (breakdown.beta.score <= 5) factors.push("Increased leverage or concentration could raise beta");
  if (breakdown.volatility.score <= 5) factors.push("Earnings misses or macro shocks could increase volatility");
  if (breakdown.marketCap.score <= 4) factors.push("Further market cap decline would increase liquidity risk");
  if (breakdown.profitability.score <= 4) factors.push("Margin compression or losses would worsen risk");
  if (breakdown.debt.score <= 4) factors.push("Additional debt or covenant breaches");
  if (breakdown.momentum.score <= 5) factors.push("Continued negative momentum and outflows");
  if (breakdown.sectorRisk.score <= 5) factors.push("Sector-specific headwinds or regulatory changes");
  if (factors.length === 0) factors.push("Limited upside to risk from current levels");
  return factors.slice(0, 4);
}

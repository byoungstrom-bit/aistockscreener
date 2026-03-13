/**
 * Finnhub API client
 * https://finnhub.io/docs/api
 *
 * Used when FINNHUB_API_KEY is set. Returns raw API responses.
 */

const BASE = "https://finnhub.io/api/v1";

function getDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export interface FinnhubProfile {
  name?: string;
  finnhubIndustry?: string;
  marketCapitalization?: number;
}

export interface FinnhubMetric {
  beta?: number;
  volatility1yAnnual?: number;
  "priceRelativeToS&P5001Month"?: number;
  "priceRelativeToS&P5003Month"?: number;
  netProfitMargin?: number;
  roe?: number;
  "totalDebt/totalEquity"?: number;
  currentRatio?: number;
}

export interface FinnhubNewsItem {
  headline?: string;
  summary?: string;
  url?: string;
  datetime?: number;
  source?: string;
}

export async function fetchFinnhubProfile(
  symbol: string,
  token: string
): Promise<FinnhubProfile> {
  const res = await fetch(`${BASE}/stock/profile2?symbol=${symbol}&token=${token}`);
  return res.json();
}

export async function fetchFinnhubMetric(
  symbol: string,
  token: string
): Promise<{ metric?: FinnhubMetric }> {
  const res = await fetch(`${BASE}/stock/metric?symbol=${symbol}&metric=all&token=${token}`);
  return res.json();
}

export async function fetchFinnhubNews(
  symbol: string,
  token: string
): Promise<FinnhubNewsItem[]> {
  const to = getDate(0);
  const from = getDate(-7);
  const res = await fetch(
    `${BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${token}`
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

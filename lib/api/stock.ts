/**
 * Stock data fetcher
 *
 * Uses Finnhub when FINNHUB_API_KEY is set.
 * Falls back to mock data when key is missing or API fails.
 */

import { StockData } from "@/lib/types";
import { getMockStockData } from "@/lib/mockData";
import {
  fetchFinnhubProfile,
  fetchFinnhubMetric,
  fetchFinnhubNews,
} from "./finnhub";

const SECTOR_MAP: Record<string, string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  financial: "Financial",
  consumer: "Consumer",
  energy: "Energy",
  industrial: "Industrial",
  utilities: "Utilities",
  "real estate": "Real Estate",
  materials: "Materials",
  "basic materials": "Basic Materials",
  "consumer cyclical": "Consumer Cyclical",
  "consumer defensive": "Consumer Defensive",
  communication: "Communication",
  "communication services": "Communication",
  unknown: "Unknown",
};

export async function fetchStockData(ticker: string): Promise<StockData> {
  const apiKey = process.env.FINNHUB_API_KEY?.trim();

  if (!apiKey) {
    return getMockStockData(ticker);
  }

  const symbol = ticker.toUpperCase();

  try {
    const [profile, { metric }, newsRaw] = await Promise.all([
      fetchFinnhubProfile(symbol, apiKey),
      fetchFinnhubMetric(symbol, apiKey),
      fetchFinnhubNews(symbol, apiKey),
    ]);

    const sector = profile?.finnhubIndustry
      ? SECTOR_MAP[profile.finnhubIndustry.toLowerCase()] ?? profile.finnhubIndustry
      : "Unknown";

    const priceChange1M = metric?.["priceRelativeToS&P5001Month"];
    const priceChange3M = metric?.["priceRelativeToS&P5003Month"];

    const news = newsRaw.slice(0, 5).map((n) => ({
      headline: n.headline ?? "",
      summary: n.summary ?? "",
      url: n.url ?? "",
      datetime: n.datetime ?? 0,
      source: n.source ?? "Finnhub",
    }));

    return {
      ticker: symbol,
      companyName: profile?.name ?? `${symbol} Inc.`,
      sector,
      marketCap: profile?.marketCapitalization ?? 0,
      beta: metric?.beta ?? 1.0,
      volatility: metric?.volatility1yAnnual ?? 0.25,
      priceChange1M: typeof priceChange1M === "number" ? priceChange1M / 100 : 0,
      priceChange3M: typeof priceChange3M === "number" ? priceChange3M / 100 : 0,
      profitMargin: metric?.netProfitMargin != null ? metric.netProfitMargin / 100 : undefined,
      roe: metric?.roe != null ? metric.roe / 100 : undefined,
      debtToEquity: metric?.["totalDebt/totalEquity"],
      currentRatio: metric?.currentRatio,
      news,
    };
  } catch (error) {
    console.error("Finnhub API error, falling back to mock:", error);
    return getMockStockData(ticker);
  }
}

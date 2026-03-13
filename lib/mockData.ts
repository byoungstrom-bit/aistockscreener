import { StockData } from "./types";

// Sector risk weights - higher = riskier sector
const SECTOR_RISK: Record<string, number> = {
  Technology: 0.7,
  Healthcare: 0.5,
  Financial: 0.6,
  Consumer: 0.4,
  Energy: 0.8,
  Industrial: 0.5,
  Utilities: 0.3,
  "Real Estate": 0.6,
  Materials: 0.6,
  Communication: 0.5,
  "Consumer Cyclical": 0.7,
  "Consumer Defensive": 0.3,
  "Basic Materials": 0.6,
  Unknown: 0.5,
};

export function getMockStockData(ticker: string): StockData {
  const upperTicker = ticker.toUpperCase();
  const sectors = Object.keys(SECTOR_RISK);
  const sector = sectors[Math.abs(hashCode(upperTicker)) % sectors.length] || "Technology";

  return {
    ticker: upperTicker,
    companyName: `${upperTicker} Inc.`,
    sector,
    marketCap: 50000000000 + (hashCode(upperTicker) % 900000000000),
    beta: 0.8 + (Math.abs(hashCode(upperTicker) % 100) / 100) * 1.4,
    volatility: 0.15 + (Math.abs(hashCode(upperTicker + "v") % 100) / 100) * 0.35,
    priceChange1M: -0.15 + (Math.abs(hashCode(upperTicker + "1") % 100) / 100) * 0.4,
    priceChange3M: -0.2 + (Math.abs(hashCode(upperTicker + "3") % 100) / 100) * 0.6,
    profitMargin: 0.05 + (Math.abs(hashCode(upperTicker + "p") % 100) / 100) * 0.25,
    roe: 0.08 + (Math.abs(hashCode(upperTicker + "r") % 100) / 100) * 0.2,
    debtToEquity: 0.3 + (Math.abs(hashCode(upperTicker + "d") % 100) / 100) * 2.5,
    currentRatio: 1.2 + (Math.abs(hashCode(upperTicker + "c") % 100) / 100) * 2.5,
    news: [
      {
        headline: `${upperTicker} reports quarterly earnings`,
        summary: `Company ${upperTicker} announced its latest quarterly results. Analysts are reviewing the figures.`,
        url: "https://example.com/news/1",
        datetime: Date.now() / 1000 - 86400,
        source: "Mock News",
      },
      {
        headline: `Market update: ${upperTicker} sector outlook`,
        summary: `Industry analysts provide outlook for the ${sector} sector.`,
        url: "https://example.com/news/2",
        datetime: Date.now() / 1000 - 172800,
        source: "Mock News",
      },
    ],
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

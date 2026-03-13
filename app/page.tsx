"use client";

import { useState, useCallback, useEffect } from "react";
import { StockInputForm } from "@/components/StockInputForm";
import { RiskResults } from "@/components/RiskResults";
import { NewsAnalyzer } from "@/components/NewsAnalyzer";
import {
  StockData,
  RiskProfile,
  RiskExplanation,
} from "@/lib/types";
import { calculateRiskScore } from "@/lib/scoring";
import { getPositionSizing } from "@/lib/positionSizing";
import { generateRiskExplanation } from "@/lib/riskExplanation";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("Moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [riskScore, setRiskScore] = useState<ReturnType<typeof calculateRiskScore> | null>(null);
  const [explanation, setExplanation] = useState<RiskExplanation | null>(null);
  const [positionSizing, setPositionSizing] = useState<ReturnType<typeof getPositionSizing> | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setStockData(null);
    setRiskScore(null);
    setExplanation(null);
    setPositionSizing(null);
    try {
      const res = await fetch(`/api/stock?ticker=${encodeURIComponent(ticker.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Failed to fetch stock data. Check your connection or try again.";
        throw new Error(msg);
      }
      const data: StockData = await res.json();
      setStockData(data);
      const score = calculateRiskScore(data);
      setRiskScore(score);
      setExplanation(generateRiskExplanation(data, score));
      setPositionSizing(getPositionSizing(score.score, riskProfile));
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticker, riskProfile]);

  const handleReset = useCallback(() => {
    setTicker("");
    setRiskProfile("Moderate");
    setError(null);
    setStockData(null);
    setRiskScore(null);
    setExplanation(null);
    setPositionSizing(null);
  }, []);

  useEffect(() => {
    if (riskScore) {
      setPositionSizing(getPositionSizing(riskScore.score, riskProfile));
    }
  }, [riskProfile, riskScore]);

  const handleCopySummary = useCallback(() => {
    if (!stockData || !riskScore || !explanation || !positionSizing) return;
    const lines = [
      explanation.summary,
      "",
      "Top risk drivers:",
      ...explanation.topRiskDrivers.map((d) => `- ${d}`),
      "",
      "Suggested allocation:",
      positionSizing.rangeLabel,
      "",
      positionSizing.caveat,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  }, [stockData, riskScore, explanation, positionSizing]);

  const hasResults = stockData && riskScore && explanation && positionSizing;
  const isEmpty = !hasResults && !loading && !error;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8, color: "#2563eb", fontWeight: 600 }}>RiskSizer</h1>
      <p style={{ marginBottom: 24, color: "#666", fontSize: 14 }}>
        Stock risk estimation and portfolio position sizing tool
      </p>

      <StockInputForm
        ticker={ticker}
        riskProfile={riskProfile}
        loading={loading}
        onTickerChange={setTicker}
        onRiskProfileChange={setRiskProfile}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
      />

      {loading && (
        <div style={{ marginTop: 24, padding: 24, textAlign: "center", border: "1px solid #dbeafe" }}>
          <div style={{ marginBottom: 8, color: "#2563eb" }}>Analyzing {ticker.trim()}...</div>
          <div style={{ fontSize: 13, color: "#666" }}>Fetching data and calculating risk score</div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#fee",
            color: "#c00",
            border: "1px solid #fcc",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {isEmpty && (
        <div
          style={{
            marginTop: 24,
            padding: 32,
            border: "1px dashed #93c5fd",
            textAlign: "center",
            color: "#666",
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 16 }}>Enter a stock ticker and click Analyze</div>
          <div style={{ fontSize: 13 }}>Example: AAPL, MSFT, GOOGL</div>
        </div>
      )}

      {hasResults && !loading && (
        <RiskResults
          stockData={stockData}
          riskScore={riskScore}
          explanation={explanation}
          positionSizing={positionSizing}
          onCopySummary={handleCopySummary}
        />
      )}

      <NewsAnalyzer />

      <p
        style={{
          marginTop: 32,
          padding: 12,
          fontSize: 12,
          color: "#666",
          border: "1px solid #dbeafe",
          background: "#f8fafc",
        }}
      >
        This tool is for educational and decision-support purposes only and does not constitute
        investment advice.
      </p>
    </main>
  );
}

"use client";

import { ScoreBreakdown as ScoreBreakdownType } from "@/lib/types";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  totalScore: number;
}

const LABELS: Record<keyof ScoreBreakdownType, string> = {
  beta: "Beta",
  volatility: "Volatility",
  marketCap: "Market Cap",
  profitability: "Profitability",
  debt: "Debt Level",
  momentum: "Momentum",
  sectorRisk: "Sector Risk",
};

function formatValue(key: string, value: number | string): string {
  if (key === "volatility") return `${(Number(value) * 100).toFixed(1)}%`;
  if (key === "marketCap") {
    const v = Number(value);
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v}`;
  }
  if (key === "profitability" || key === "momentum") return `${(Number(value) * 100).toFixed(1)}%`;
  if (key === "sectorRisk") return String(value);
  return Number(value).toFixed(2);
}

export function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
  const entries = (Object.entries(breakdown) as [keyof ScoreBreakdownType, (typeof breakdown)[keyof ScoreBreakdownType]][])
    .map(([key, item]) => ({ key, ...item }))
    .sort((a, b) => b.contribution - a.contribution);

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 8, fontSize: 16 }}>Score Breakdown</h3>
      <p style={{ marginBottom: 12, fontSize: 12, color: "#666" }}>
        Each factor contributes: score × weight. Total = {totalScore.toFixed(1)}.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th style={{ textAlign: "left", padding: 8 }}>Factor</th>
            <th style={{ textAlign: "left", padding: 8 }}>Value</th>
            <th style={{ textAlign: "left", padding: 8 }}>Score</th>
            <th style={{ textAlign: "left", padding: 8 }}>Weight</th>
            <th style={{ textAlign: "left", padding: 8 }}>Contribution</th>
            <th style={{ textAlign: "left", padding: 8 }}>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(({ key, value, score, weight, contribution, explanation }) => (
            <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{LABELS[key]}</td>
              <td style={{ padding: 8 }}>{formatValue(key, value)}</td>
              <td style={{ padding: 8 }}>{score.toFixed(1)}</td>
              <td style={{ padding: 8 }}>{(weight * 100).toFixed(0)}%</td>
              <td style={{ padding: 8 }}>{contribution.toFixed(2)}</td>
              <td style={{ padding: 8, fontSize: 12, color: "#555" }}>{explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

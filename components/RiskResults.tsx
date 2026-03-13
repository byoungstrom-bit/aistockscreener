"use client";

import {
  StockData,
  RiskScore,
  RiskExplanation,
  PositionSizing,
} from "@/lib/types";
import { ScoreBreakdown } from "./ScoreBreakdown";

interface RiskResultsProps {
  stockData: StockData;
  riskScore: RiskScore;
  explanation: RiskExplanation;
  positionSizing: PositionSizing;
  onCopySummary: () => void;
}

export function RiskResults({
  stockData,
  riskScore,
  explanation,
  positionSizing,
  onCopySummary,
}: RiskResultsProps) {
  return (
    <div style={{ marginTop: 24, padding: 16, border: "1px solid #ccc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>
          {stockData.companyName} ({stockData.ticker})
        </h2>
        <button onClick={onCopySummary} style={{ padding: "6px 12px", fontSize: 14 }}>
          Copy Summary
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>Risk Score</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>{riskScore.score.toFixed(1)}/10</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>Risk Tier</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>{riskScore.tier}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>Suggested Allocation</div>
            <div style={{ fontSize: 24, fontWeight: "bold" }}>{positionSizing.rangeLabel}</div>
          </div>
        </div>
      </div>

      {positionSizing.caveat && (
        <div style={{ marginBottom: 16, padding: 12, background: "#f5f5f5", fontSize: 13 }}>
          {positionSizing.caveat}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8, fontSize: 16 }}>Summary</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{explanation.summary}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8, fontSize: 16 }}>Top Risk Drivers</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {explanation.topRiskDrivers.map((d, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>Factors That Could Improve Risk</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {explanation.improvingFactors.map((f, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>Factors That Could Worsen Risk</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {explanation.worseningFactors.map((f, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ScoreBreakdown breakdown={riskScore.breakdown} totalScore={riskScore.score} />
    </div>
  );
}

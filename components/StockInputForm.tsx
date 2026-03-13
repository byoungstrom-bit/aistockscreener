"use client";

import { RiskProfile } from "@/lib/types";

interface StockInputFormProps {
  ticker: string;
  riskProfile: RiskProfile;
  loading: boolean;
  onTickerChange: (value: string) => void;
  onRiskProfileChange: (value: RiskProfile) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export function StockInputForm({
  ticker,
  riskProfile,
  loading,
  onTickerChange,
  onRiskProfileChange,
  onAnalyze,
  onReset,
}: StockInputFormProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label htmlFor="ticker" style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
            Stock Ticker
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL"
            disabled={loading}
            style={{
              padding: "8px 12px",
              fontSize: 16,
              minWidth: 120,
              textTransform: "uppercase",
            }}
          />
        </div>
        <div>
          <label htmlFor="riskProfile" style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
            Risk Profile
          </label>
          <select
            id="riskProfile"
            value={riskProfile}
            onChange={(e) => onRiskProfileChange(e.target.value as RiskProfile)}
            disabled={loading}
            style={{ padding: "8px 12px", fontSize: 16, minWidth: 140 }}
          >
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <button
            onClick={onAnalyze}
            disabled={loading || !ticker.trim()}
            style={{
              padding: "8px 20px",
              fontSize: 16,
              cursor: loading || !ticker.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            onClick={onReset}
            disabled={loading}
            style={{ padding: "8px 20px", fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

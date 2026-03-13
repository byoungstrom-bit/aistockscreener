"use client";

import { useState } from "react";
import { NewsAnalysisResult } from "@/lib/types";

export function NewsAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NewsAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setText("");
    setResult(null);
    setError(null);
  }

  return (
    <div style={{ marginTop: 24, padding: 16, border: "1px solid #dbeafe", borderRadius: 6, background: "#fff" }}>
      <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>News Impact Interpretation</h2>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        Paste news text to analyze sentiment, materiality, event type, and potential investor reaction. This is for interpretation only, not prediction.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste news article text here..."
        disabled={loading}
        rows={6}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 14,
          fontFamily: "inherit",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            cursor: loading || !text.trim() ? "not-allowed" : "pointer",
            background: loading || !text.trim() ? undefined : "#2563eb",
            color: loading || !text.trim() ? undefined : "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          {loading ? "Analyzing..." : "Analyze Impact"}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ padding: "8px 20px", fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}
        >
          Reset
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: "#fee", color: "#c00" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 12, background: "#f0f9ff", borderRadius: 4 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Interpretation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 12, color: "#666" }}>Sentiment: </span>
              <strong>{result.sentiment}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#666" }}>Materiality: </span>
              <strong>{result.materiality}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#666" }}>Event type: </span>
              <strong>{result.eventType}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#666" }}>Investor reaction: </span>
              <strong>{result.investorReaction}</strong>
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{result.reasoning}</div>
        </div>
      )}
    </div>
  );
}

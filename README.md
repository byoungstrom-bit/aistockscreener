# RiskSizer

RiskSizer is an investing decision-support tool that estimates stock risk and suggests portfolio position sizing. It is designed for educational and informational purposes only—not as investment advice.

## Project Overview

RiskSizer helps users:

1. **Assess stock risk** – Enter a ticker to get a rule-based risk score (1–10) and tier (Low, Moderate, High, Speculative)
2. **Size positions** – Get suggested allocation ranges based on risk score and your risk profile (Conservative, Moderate, Aggressive)
3. **Understand drivers** – See top risk drivers, factor contributions, improving factors, and worsening factors
4. **Interpret news** – Paste news text for sentiment, materiality, event type, and potential investor reaction (interpretation only, not prediction)

## Architecture

```
app/
  page.tsx              # Main page, state, empty/loading/error/reset flows
  layout.tsx            # Root layout
  api/
    stock/route.ts      # GET /api/stock?ticker=X
    news/route.ts       # POST /api/news

components/
  StockInputForm.tsx    # Ticker input, risk profile, analyze/reset
  RiskResults.tsx       # Risk score, allocation, explanation, copy summary
  NewsAnalyzer.tsx      # News text input and impact interpretation
  ScoreBreakdown.tsx    # Factor contributions and explanations

lib/
  types.ts              # Shared TypeScript types
  api/
    finnhub.ts          # Finnhub API client
    stock.ts            # Stock data fetcher (Finnhub or mock)
    index.ts
  mockData.ts           # Mock stock data (when no API key)
  scoring.ts            # Risk scoring engine
  positionSizing.ts     # Allocation range logic
  riskExplanation.ts   # Deterministic explanation templates
  newsAnalysis.ts       # News impact analysis (mock or future LLM)
```

## How Scoring Works

The risk score is a weighted sum of seven factors (1–10 scale, higher = riskier). Each factor’s **contribution** = score × weight.

| Factor       | Weight | Logic |
|--------------|--------|-------|
| Beta         | 20%    | &lt;0.8 low, 0.8–1.2 moderate, &gt;1.2 high |
| Volatility   | 20%    | Annualized volatility scaled to 1–10 |
| Market Cap   | 15%    | Larger cap = lower risk |
| Profitability| 15%    | Margins and ROE |
| Debt         | 10%    | Debt/equity and current ratio |
| Momentum     | 10%    | Recent price change (1M, 3M) |
| Sector Risk  | 10%    | Sector-specific risk scores |

Tiers: **Low** (1–2.5), **Moderate** (2.5–5), **High** (5–7.5), **Speculative** (7.5–10).

## How to Add API Keys

1. Copy `.env.example` to `.env.local`
2. Add your keys:
   - **FINNHUB_API_KEY** – [finnhub.io](https://finnhub.io) (stock data)
   - **OPENAI_API_KEY** – [platform.openai.com](https://platform.openai.com) (future news LLM)
3. Restart the dev server.

**Without API keys**, the app runs in mock mode: realistic mock stock data and keyword-based news analysis.

## How to Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Summary: Where Things Live

| Concern | Location |
|---------|----------|
| **Scoring logic** | `lib/scoring.ts` – factor scores, weights, tier mapping |
| **News analyzer logic** | `lib/newsAnalysis.ts` – sentiment, materiality, event type, investor reaction |
| **API integrations** | `lib/api/finnhub.ts` (Finnhub), `lib/api/stock.ts` (orchestration) |
| **Future UI improvements** | `components/` (StockInputForm, RiskResults, NewsAnalyzer, ScoreBreakdown), `app/page.tsx` (layout, empty/loading states) |

---

## Disclaimer

This tool is for educational and decision-support purposes only and does not constitute investment advice. Always do your own research and consider consulting a financial advisor.

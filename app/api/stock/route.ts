import { NextRequest, NextResponse } from "next/server";
import { fetchStockData } from "@/lib/api/stock";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker || typeof ticker !== "string") {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }
  if (ticker.length > 10) {
    return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
  }
  try {
    const data = await fetchStockData(ticker.trim());
    return NextResponse.json(data);
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}

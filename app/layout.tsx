import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RiskSizer - Stock Risk & Position Sizing",
  description: "Investing decision-support tool for stock risk estimation and portfolio position sizing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", padding: 24 }}>
        {children}
      </body>
    </html>
  );
}

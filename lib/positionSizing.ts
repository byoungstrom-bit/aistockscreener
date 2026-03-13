/**
 * Portfolio Position Sizing
 *
 * Conservative, realistic allocation ranges. Ranges are intentionally wide
 * to reflect uncertainty. Never outputs a single number.
 */

import { RiskProfile, PositionSizing } from "./types";

type RiskBand = "low" | "moderate" | "high" | "speculative";

// Ranges are [min%, max%]. Conservative to avoid overconfidence.
const ALLOCATION_MATRIX: Record<
  RiskProfile,
  Record<RiskBand, [number, number]>
> = {
  Conservative: {
    low: [0.5, 1.5],
    moderate: [0.25, 0.75],
    high: [0.1, 0.4],
    speculative: [0, 0.2],
  },
  Moderate: {
    low: [1.5, 3],
    moderate: [0.75, 2],
    high: [0.4, 1],
    speculative: [0.2, 0.5],
  },
  Aggressive: {
    low: [2.5, 5],
    moderate: [1.5, 3.5],
    high: [0.75, 2],
    speculative: [0.4, 1],
  },
};

const CAVEATS: Record<RiskProfile, string> = {
  Conservative:
    "Consider starting at the lower end of the range. Rebalance as conviction changes.",
  Moderate:
    "Use the range as a guide; adjust based on your own research and conviction.",
  Aggressive:
    "Higher allocations imply higher risk. Ensure adequate diversification.",
};

export function getPositionSizing(
  riskScore: number,
  riskProfile: RiskProfile
): PositionSizing {
  const matrix = ALLOCATION_MATRIX[riskProfile];
  let band: RiskBand;

  if (riskScore <= 2.5) band = "low";
  else if (riskScore <= 5) band = "moderate";
  else if (riskScore <= 7.5) band = "high";
  else band = "speculative";

  const [minAllocation, maxAllocation] = matrix[band];
  const rangeLabel = `${minAllocation}–${maxAllocation}%`;

  return {
    minAllocation,
    maxAllocation,
    rangeLabel,
    caveat: CAVEATS[riskProfile],
  };
}

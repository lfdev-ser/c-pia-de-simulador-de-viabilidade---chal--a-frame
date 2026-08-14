import { describe, expect, it } from 'vitest';
import { calculateEPSOptimization } from '../client/src/lib/epsOptimization';

describe('EPS optimization data used by reports', () => {
  it('identifies cut forms when a dimension is not a multiple', () => {
    const result = calculateEPSOptimization(3.5, 3.6, 5.1);

    expect(result.optimalLength).toBe(6.25);
    expect(result.optimalHeight).toBe(3.6);
    expect(result.blockDetails.cutBlocks).toBeGreaterThan(0);
    expect(result.optimalBlockDetails.cutBlocks).toBe(0);
    expect(result.hasWaste).toBe(true);
  });

  it('reports no material optimization waste for exact multiples', () => {
    const result = calculateEPSOptimization(3.5, 3.6, 5);

    expect(result.optimalLength).toBe(5);
    expect(result.optimalHeight).toBe(3.6);
    expect(result.optimalBlockDetails.cutBlocks).toBe(0);
    expect(result.wastePercentage).toBe(0);
  });
});

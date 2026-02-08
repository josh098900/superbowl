import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import QuarterBreakdown from '../components/QuarterBreakdown';

/**
 * Property 12: Quarter breakdown shows per-quarter scores
 *
 * For any valid QuarterScoreData with N completed quarters, the QuarterBreakdown
 * component shall render N rows, each showing the quarter number and both teams'
 * scores for that quarter.
 *
 * **Validates: Requirements 8.1**
 */

const quarterArb = (quarterNum) =>
  fc.record({
    quarter: fc.constant(quarterNum),
    homeScore: fc.integer({ min: 0, max: 21 }),
    awayScore: fc.integer({ min: 0, max: 21 }),
  });

const quarterScoresArb = fc
  .integer({ min: 1, max: 4 })
  .chain((n) =>
    fc.tuple(...Array.from({ length: n }, (_, i) => quarterArb(i + 1)))
  )
  .map((quarters) => ({ quarters }));

describe('Property 12: Quarter breakdown shows per-quarter scores', () => {
  it('renders each quarter with both teams scores', () => {
    fc.assert(
      fc.property(quarterScoresArb, (quarterScores) => {
        const { container } = render(<QuarterBreakdown quarterScores={quarterScores} />);
        const text = container.textContent;

        for (const q of quarterScores.quarters) {
          expect(text).toContain(`Q${q.quarter}`);
          expect(text).toContain(String(q.homeScore));
          expect(text).toContain(String(q.awayScore));
        }

        const rows = container.querySelectorAll('[data-testid^="quarter-row-"]');
        expect(rows.length).toBe(quarterScores.quarters.length);
      }),
      { numRuns: 100 }
    );
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import PredictionCard from '../components/PredictionCard';

/**
 * Property 14: Prediction tracking indicators
 *
 * For any Prediction where isCorrect is true, the PredictionCard shall render a
 * positive (green) indicator. For false, a negative (red) indicator. For null,
 * a pending (gray) indicator.
 *
 * **Validates: Requirements 9.3**
 */

const scoresArb = fc.record({
  home: fc.record({
    name: fc.constant('Patriots'),
    abbreviation: fc.constant('NE'),
    score: fc.integer({ min: 0, max: 60 }),
    logo: fc.constant(''),
  }),
  away: fc.record({
    name: fc.constant('Seahawks'),
    abbreviation: fc.constant('SEA'),
    score: fc.integer({ min: 0, max: 60 }),
    logo: fc.constant(''),
  }),
});

describe('Property 14: Prediction tracking indicators', () => {
  it('renders pending indicators during pregame', () => {
    fc.assert(
      fc.property(scoresArb, (scores) => {
        const { container } = render(
          <PredictionCard gameStatus="pregame" scores={scores} playerStats={{}} />
        );
        const pendingDots = container.querySelectorAll('[data-testid="indicator-pending"]');
        // All 4 predictions should be pending during pregame
        expect(pendingDots.length).toBe(4);
        expect(container.querySelectorAll('[data-testid="indicator-correct"]').length).toBe(0);
        expect(container.querySelectorAll('[data-testid="indicator-incorrect"]').length).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('renders correct indicator when total points matches prediction', () => {
    // Total points prediction is 47, so away=27 + home=20 = 47
    const { container } = render(
      <PredictionCard
        gameStatus="final"
        scores={{
          home: { name: 'Patriots', abbreviation: 'NE', score: 20, logo: '' },
          away: { name: 'Seahawks', abbreviation: 'SEA', score: 27, logo: '' },
        }}
        playerStats={{}}
      />
    );
    const correctDots = container.querySelectorAll('[data-testid="indicator-correct"]');
    expect(correctDots.length).toBeGreaterThanOrEqual(1);
  });

  it('renders incorrect indicator when total points exceeds prediction', () => {
    const { container } = render(
      <PredictionCard
        gameStatus="final"
        scores={{
          home: { name: 'Patriots', abbreviation: 'NE', score: 30, logo: '' },
          away: { name: 'Seahawks', abbreviation: 'SEA', score: 30, logo: '' },
        }}
        playerStats={{}}
      />
    );
    const incorrectDots = container.querySelectorAll('[data-testid="indicator-incorrect"]');
    expect(incorrectDots.length).toBeGreaterThanOrEqual(1);
  });
});

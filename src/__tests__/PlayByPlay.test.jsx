import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import PlayByPlay from '../components/PlayByPlay';

/**
 * Properties 4, 5, 6 for PlayByPlay component.
 *
 * **Validates: Requirements 3.1, 3.3, 3.4**
 */

const playArb = fc.record({
  id: fc.uuid(),
  description: fc.stringMatching(/^[A-Za-z0-9 .]{5,40}$/),
  down: fc.integer({ min: 1, max: 4 }),
  distance: fc.integer({ min: 1, max: 30 }),
  yardLine: fc.integer({ min: 1, max: 99 }),
  isScoring: fc.boolean(),
  team: fc.constantFrom('SEA', 'NE'),
  quarter: fc.integer({ min: 1, max: 4 }),
  clock: fc.constantFrom('14:52', '10:30', '7:23', '2:00', '0:05'),
});

describe('Property 4: Play feed limited to 15 most recent', () => {
  it('renders at most 15 plays from the most recent', () => {
    fc.assert(
      fc.property(
        fc.array(playArb, { minLength: 0, maxLength: 50 }),
        (plays) => {
          const { container } = render(<PlayByPlay plays={plays} />);
          const items = container.querySelectorAll('[data-testid="play-item"]');

          expect(items.length).toBeLessThanOrEqual(15);
          expect(items.length).toBe(Math.min(plays.length, 15));
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 5: Play rendering includes all required fields', () => {
  it('renders description, down, distance, and yard line for each play', () => {
    fc.assert(
      fc.property(
        fc.array(playArb, { minLength: 1, maxLength: 5 }),
        (plays) => {
          const { container } = render(<PlayByPlay plays={plays} />);
          const text = container.textContent;

          // All plays are rendered (<=15), check each one's fields appear
          for (const play of plays.slice(-15)) {
            expect(text).toContain(play.description);
            expect(text).toContain(String(play.down));
            expect(text).toContain(String(play.distance));
            expect(text).toContain(String(play.yardLine));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 6: Scoring plays receive gold highlight', () => {
  it('applies gold accent styling only to scoring plays', () => {
    fc.assert(
      fc.property(
        fc.array(playArb, { minLength: 1, maxLength: 10 }),
        (plays) => {
          const { container } = render(<PlayByPlay plays={plays} />);
          const items = container.querySelectorAll('[data-testid="play-item"]');

          // Items are rendered in reverse order (newest first), and only last 15
          const recentPlays = plays.slice(-15).reverse();

          items.forEach((item, i) => {
            const play = recentPlays[i];
            if (play.isScoring) {
              expect(item.className).toContain('gold-accent');
            } else {
              expect(item.className).not.toContain('gold-accent');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

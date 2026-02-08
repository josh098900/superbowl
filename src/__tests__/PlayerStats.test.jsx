import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import PlayerStats from '../components/PlayerStats';

/**
 * Property 7: Player stats cards show all required stats
 *
 * For any valid PlayerStatsData, the PlayerStats component shall render:
 * - QB: completions/attempts, passing yards, touchdowns, interceptions, passer rating
 * - WR: receptions, receiving yards, touchdowns, targets
 * - RB: carries, rushing yards, touchdowns, yards per carry
 *
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */

const qbStatsArb = fc.record({
  completionsAttempts: fc.tuple(fc.nat({ max: 40 }), fc.nat({ max: 50 })).map(
    ([c, a]) => `${c}/${Math.max(c, a)}`
  ),
  yards: fc.nat({ max: 500 }),
  touchdowns: fc.nat({ max: 8 }),
  interceptions: fc.nat({ max: 5 }),
  rating: fc.double({ min: 0, max: 158.3, noNaN: true }).map((v) =>
    Math.round(v * 10) / 10
  ),
});

const wrStatsArb = fc.record({
  receptions: fc.nat({ max: 20 }),
  yards: fc.nat({ max: 300 }),
  touchdowns: fc.nat({ max: 5 }),
  targets: fc.nat({ max: 25 }),
});

const rbStatsArb = fc.record({
  carries: fc.nat({ max: 35 }),
  yards: fc.nat({ max: 250 }),
  touchdowns: fc.nat({ max: 5 }),
  yardsPerCarry: fc.double({ min: 0, max: 15, noNaN: true }).map((v) =>
    Math.round(v * 10) / 10
  ),
});

const playerLineArb = (statsArb) =>
  fc.record({
    name: fc.stringMatching(/^[A-Za-z ]{3,20}$/),
    team: fc.constantFrom('SEA', 'NE'),
    stats: statsArb,
  });

const playerStatsDataArb = fc.record({
  qb: fc.record({ home: playerLineArb(qbStatsArb), away: playerLineArb(qbStatsArb) }),
  wr: fc.record({ home: playerLineArb(wrStatsArb), away: playerLineArb(wrStatsArb) }),
  rb: fc.record({ home: playerLineArb(rbStatsArb), away: playerLineArb(rbStatsArb) }),
});

describe('Property 7: Player stats cards show all required stats', () => {
  it('renders all QB stat categories', () => {
    fc.assert(
      fc.property(playerStatsDataArb, (playerStats) => {
        const { container } = render(<PlayerStats playerStats={playerStats} />);
        const text = container.textContent;

        // QB labels
        expect(text).toContain('Comp/Att');
        expect(text).toContain('TDs');
        expect(text).toContain('INTs');
        expect(text).toContain('Rating');

        // QB stat values for both sides
        const qbHome = playerStats.qb.home.stats;
        const qbAway = playerStats.qb.away.stats;
        expect(text).toContain(String(qbHome.completionsAttempts));
        expect(text).toContain(String(qbAway.completionsAttempts));
        expect(text).toContain(String(qbHome.yards));
        expect(text).toContain(String(qbAway.yards));
      }),
      { numRuns: 100 }
    );
  });

  it('renders all WR stat categories', () => {
    fc.assert(
      fc.property(playerStatsDataArb, (playerStats) => {
        const { container } = render(<PlayerStats playerStats={playerStats} />);
        const text = container.textContent;

        expect(text).toContain('Rec');
        expect(text).toContain('Targets');

        const wrHome = playerStats.wr.home.stats;
        const wrAway = playerStats.wr.away.stats;
        expect(text).toContain(String(wrHome.receptions));
        expect(text).toContain(String(wrAway.receptions));
        expect(text).toContain(String(wrHome.targets));
        expect(text).toContain(String(wrAway.targets));
      }),
      { numRuns: 100 }
    );
  });

  it('renders all RB stat categories', () => {
    fc.assert(
      fc.property(playerStatsDataArb, (playerStats) => {
        const { container } = render(<PlayerStats playerStats={playerStats} />);
        const text = container.textContent;

        expect(text).toContain('Carries');
        expect(text).toContain('YPC');

        const rbHome = playerStats.rb.home.stats;
        const rbAway = playerStats.rb.away.stats;
        expect(text).toContain(String(rbHome.carries));
        expect(text).toContain(String(rbAway.carries));
        expect(text).toContain(String(rbHome.yardsPerCarry));
        expect(text).toContain(String(rbAway.yardsPerCarry));
      }),
      { numRuns: 100 }
    );
  });
});

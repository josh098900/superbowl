import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import TeamStats from '../components/TeamStats';

/**
 * Property 9: Team stats display all required fields
 *
 * For any valid TeamStatsData, the TeamStats component shall render total yards,
 * first downs, turnovers, third-down conversion percentage, red zone percentage,
 * and time of possession for both teams.
 *
 * **Validates: Requirements 6.1, 6.2**
 */

const teamStatSideArb = fc.record({
  totalYards: fc.integer({ min: 0, max: 600 }),
  firstDowns: fc.integer({ min: 0, max: 40 }),
  turnovers: fc.integer({ min: 0, max: 10 }),
  thirdDownPct: fc.constantFrom('0%', '33%', '50%', '67%', '100%'),
  redZonePct: fc.constantFrom('0%', '50%', '75%', '100%'),
  timeOfPossession: fc.constantFrom('15:00', '20:30', '30:00', '35:45'),
  sacks: fc.integer({ min: 0, max: 10 }),
});

const teamStatsArb = fc.record({
  home: teamStatSideArb,
  away: teamStatSideArb,
});

describe('Property 9: Team stats display all required fields', () => {
  it('renders all stat fields for both teams', () => {
    fc.assert(
      fc.property(teamStatsArb, (teamStats) => {
        const { container } = render(<TeamStats teamStats={teamStats} />);
        const text = container.textContent;

        // All required stat values appear for both sides
        expect(text).toContain(String(teamStats.home.totalYards));
        expect(text).toContain(String(teamStats.away.totalYards));
        expect(text).toContain(String(teamStats.home.firstDowns));
        expect(text).toContain(String(teamStats.away.firstDowns));
        expect(text).toContain(String(teamStats.home.turnovers));
        expect(text).toContain(String(teamStats.away.turnovers));
        expect(text).toContain(teamStats.home.thirdDownPct);
        expect(text).toContain(teamStats.away.thirdDownPct);
        expect(text).toContain(teamStats.home.redZonePct);
        expect(text).toContain(teamStats.away.redZonePct);
        expect(text).toContain(teamStats.home.timeOfPossession);
        expect(text).toContain(teamStats.away.timeOfPossession);

        // All labels present
        expect(text).toContain('Total Yards');
        expect(text).toContain('First Downs');
        expect(text).toContain('Turnovers');
        expect(text).toContain('3rd Down %');
        expect(text).toContain('Red Zone %');
        expect(text).toContain('Time of Possession');
      }),
      { numRuns: 100 }
    );
  });
});

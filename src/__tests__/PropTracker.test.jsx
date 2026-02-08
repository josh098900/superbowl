import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import PropTracker from '../components/PropTracker';

/**
 * Property 15: Prop trackers display all tracked values
 *
 * For any valid game data, the PropTracker component shall render current values
 * for: total points vs 47.5 over/under, longest play yardage, total sacks,
 * and total turnovers.
 *
 * **Validates: Requirements 10.1**
 */

const teamStatSideArb = fc.record({
  totalYards: fc.integer({ min: 0, max: 600 }),
  firstDowns: fc.integer({ min: 0, max: 40 }),
  turnovers: fc.integer({ min: 0, max: 10 }),
  thirdDownPct: fc.constantFrom('0%', '33%', '50%'),
  redZonePct: fc.constantFrom('0%', '50%', '100%'),
  timeOfPossession: fc.constant('15:00'),
  sacks: fc.integer({ min: 0, max: 10 }),
});

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

const playArb = fc.record({
  id: fc.uuid(),
  description: fc.constant('Play'),
  down: fc.integer({ min: 1, max: 4 }),
  distance: fc.integer({ min: 1, max: 30 }),
  yardLine: fc.integer({ min: 1, max: 99 }),
  isScoring: fc.boolean(),
  team: fc.constantFrom('SEA', 'NE'),
  quarter: fc.integer({ min: 1, max: 4 }),
  clock: fc.constant('10:00'),
});

describe('Property 15: Prop trackers display all tracked values', () => {
  it('renders all four prop tracker values', () => {
    fc.assert(
      fc.property(
        fc.record({ home: teamStatSideArb, away: teamStatSideArb }),
        scoresArb,
        fc.array(playArb, { minLength: 0, maxLength: 20 }),
        (teamStats, scores, plays) => {
          const { container } = render(
            <PropTracker teamStats={teamStats} scores={scores} plays={plays} />
          );
          const text = container.textContent;

          const totalPoints = scores.home.score + scores.away.score;
          const overUnder = totalPoints > 47.5 ? 'Over' : 'Under';
          const totalSacks = teamStats.home.sacks + teamStats.away.sacks;
          const totalTurnovers = teamStats.home.turnovers + teamStats.away.turnovers;

          expect(text).toContain('Total Points O/U 47.5');
          expect(text).toContain(`${totalPoints} (${overUnder})`);
          expect(text).toContain('Longest Play');
          expect(text).toContain('yds');
          expect(text).toContain('Total Sacks');
          expect(text).toContain(String(totalSacks));
          expect(text).toContain('Total Turnovers');
          expect(text).toContain(String(totalTurnovers));
        }
      ),
      { numRuns: 100 }
    );
  });
});

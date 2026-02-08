import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import LiveScore from '../components/LiveScore';

/**
 * Property 2: LiveScore renders all game state fields
 *
 * For any valid TeamScores, GameClock, and GameStatus, the LiveScore component's
 * rendered output shall contain both team names, both scores, the current quarter,
 * the time remaining, and the game status text.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

const gameStatusArb = fc.constantFrom(
  'pregame', 'q1', 'q2', 'halftime', 'q3', 'q4', 'overtime', 'final'
);

const STATUS_LABELS = {
  pregame: 'PREGAME',
  q1: 'LIVE',
  q2: 'LIVE',
  halftime: 'HALFTIME',
  q3: 'LIVE',
  q4: 'LIVE',
  overtime: 'LIVE',
  final: 'FINAL',
};

const teamNameArb = fc.stringMatching(/^[A-Za-z ]{3,20}$/);
const abbrArb = fc.stringMatching(/^[A-Z]{2,4}$/);

const teamScoresArb = fc.record({
  home: fc.record({
    name: teamNameArb,
    abbreviation: abbrArb,
    score: fc.nat({ max: 99 }),
    logo: fc.constant(''),
  }),
  away: fc.record({
    name: teamNameArb,
    abbreviation: abbrArb,
    score: fc.nat({ max: 99 }),
    logo: fc.constant(''),
  }),
});

const gameClockArb = fc.record({
  quarter: fc.integer({ min: 1, max: 5 }),
  timeRemaining: fc.constantFrom('15:00', '12:34', '7:23', '2:00', '0:05'),
  possession: fc.constantFrom('home', 'away', null),
});

describe('Property 2: LiveScore renders all game state fields', () => {
  it('renders both team names, both scores, and game status', () => {
    fc.assert(
      fc.property(teamScoresArb, gameClockArb, gameStatusArb, (scores, clock, gameStatus) => {
        const { container } = render(
          <LiveScore scores={scores} clock={clock} gameStatus={gameStatus} />
        );
        const text = container.textContent;

        // Both team names (abbreviation) present
        expect(text).toContain(scores.home.abbreviation);
        expect(text).toContain(scores.away.abbreviation);

        // Both scores present
        expect(text).toContain(String(scores.home.score));
        expect(text).toContain(String(scores.away.score));

        // Game status label present
        expect(text).toContain(STATUS_LABELS[gameStatus]);
      }),
      { numRuns: 100 }
    );
  });

  it('renders quarter and time remaining during live play', () => {
    const liveStatusArb = fc.constantFrom('q1', 'q2', 'q3', 'q4', 'overtime');

    fc.assert(
      fc.property(teamScoresArb, gameClockArb, liveStatusArb, (scores, clock, gameStatus) => {
        const { container } = render(
          <LiveScore scores={scores} clock={clock} gameStatus={gameStatus} />
        );
        const text = container.textContent;

        expect(text).toContain(String(clock.quarter));
        expect(text).toContain(clock.timeRemaining);
      }),
      { numRuns: 100 }
    );
  });
});

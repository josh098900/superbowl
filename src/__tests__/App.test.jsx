import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';

// Mock useGameData hook
vi.mock('../hooks/useGameData', () => ({
  useGameData: vi.fn(),
}));

// Mock recharts to avoid rendering issues in test environment
vi.mock('recharts', () => ({
  LineChart: ({ children }) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => React.createElement('div', null, children),
  Legend: () => null,
}));

import { useGameData } from '../hooks/useGameData';
import App from '../App';

function makeGameData(overrides = {}) {
  return {
    eventId: '401654321',
    gameStatus: 'q2',
    scores: {
      home: { name: 'Patriots', abbreviation: 'NE', score: 10, logo: '' },
      away: { name: 'Seahawks', abbreviation: 'SEA', score: 14, logo: '' },
    },
    clock: { quarter: 2, timeRemaining: '7:23', possession: 'away' },
    plays: [],
    playerStats: {
      qb: {
        home: { name: 'Drake Maye', team: 'NE', stats: {} },
        away: { name: 'Sam Darnold', team: 'SEA', stats: {} },
      },
      wr: {
        home: { name: 'DeMario Douglas', team: 'NE', stats: {} },
        away: { name: 'Jaxon Smith-Njigba', team: 'SEA', stats: {} },
      },
      rb: {
        home: { name: 'Rhamondre Stevenson', team: 'NE', stats: {} },
        away: { name: 'Zach Charbonnet', team: 'SEA', stats: {} },
      },
    },
    teamStats: {
      home: { totalYards: 0, firstDowns: 0, turnovers: 0, thirdDownPct: '0%', redZonePct: '0%', timeOfPossession: '0:00', sacks: 0 },
      away: { totalYards: 0, firstDowns: 0, turnovers: 0, thirdDownPct: '0%', redZonePct: '0%', timeOfPossession: '0:00', sacks: 0 },
    },
    winProbability: [],
    currentDrive: null,
    quarterScores: { quarters: [] },
    isLoading: false,
    isError: false,
    consecutiveErrors: 0,
    ...overrides,
  };
}

describe('Property 16: Error banner on consecutive failures', () => {
  /**
   * **Validates: Requirements 14.3**
   *
   * Property 16: Error banner on consecutive failures
   * For any consecutiveErrors count >= 3, the Dashboard shall render a prominent error banner.
   * For any count < 3, the prominent error banner shall not be rendered.
   */
  it('shows error banner when consecutiveErrors >= 3, hides when < 3', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (errorCount) => {
        useGameData.mockReturnValue(makeGameData({ consecutiveErrors: errorCount }));

        const { unmount } = render(React.createElement(App));

        const banner = screen.queryByTestId('error-banner');

        if (errorCount >= 3) {
          expect(banner).toBeInTheDocument();
        } else {
          expect(banner).not.toBeInTheDocument();
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

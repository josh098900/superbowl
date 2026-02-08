import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the espnApi module
vi.mock('../utils/espnApi', () => ({
  fetchScoreboard: vi.fn(),
  fetchGameSummary: vi.fn(),
  normalizeGameData: vi.fn(),
  getPollingInterval: vi.fn(),
}));

import {
  fetchScoreboard,
  fetchGameSummary,
  normalizeGameData,
  getPollingInterval,
} from '../utils/espnApi';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// Minimal normalized data factory
function makeNormalized(overrides = {}) {
  return {
    gameStatus: 'q2',
    scores: {
      home: { name: 'NE', abbreviation: 'NE', score: 10, logo: '' },
      away: { name: 'SEA', abbreviation: 'SEA', score: 14, logo: '' },
    },
    clock: { quarter: 2, timeRemaining: '7:23', possession: 'away' },
    plays: [],
    playerStats: { qb: { home: {}, away: {} }, wr: { home: {}, away: {} }, rb: { home: {}, away: {} } },
    teamStats: { home: {}, away: {} },
    winProbability: [],
    currentDrive: null,
    quarterScores: { quarters: [] },
    ...overrides,
  };
}

describe('useGameData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getPollingInterval.mockReturnValue(5000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Event ID discovery', () => {
    it('returns the event ID from fetchScoreboard', async () => {
      fetchScoreboard.mockResolvedValue('401654321');
      fetchGameSummary.mockResolvedValue({ header: {} });
      normalizeGameData.mockReturnValue(makeNormalized());

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.eventId).toBe('401654321');
      });
    });

    it('returns null eventId when scoreboard is still loading', async () => {
      fetchScoreboard.mockReturnValue(new Promise(() => {})); // never resolves

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      expect(result.current.eventId).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('sets isError when scoreboard fetch fails', async () => {
      fetchScoreboard.mockRejectedValue(new Error('Super Bowl LX game not found'));

      // Use a client with no retries so the error surfaces immediately
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const wrapper = ({ children }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper });

      // The hook's own retry:2 is on the scoreboard query, but the mock
      // rejects every call, so after retries exhaust we get isError.
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 },
      );
      expect(result.current.eventId).toBeNull();
    });
  });

  describe('Polling interval based on game status', () => {
    it('uses the interval from getPollingInterval for refetching', async () => {
      fetchScoreboard.mockResolvedValue('401654321');
      fetchGameSummary.mockResolvedValue({ header: {} });
      normalizeGameData.mockReturnValue(makeNormalized({ gameStatus: 'q1' }));
      getPollingInterval.mockReturnValue(5000);

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.eventId).toBe('401654321');
      });

      expect(result.current.gameStatus).toBe('q1');
      // getPollingInterval is called by the refetchInterval callback
      expect(getPollingInterval).toHaveBeenCalledWith('q1');
    });

    it('returns pregame status with defaults when no summary data', async () => {
      fetchScoreboard.mockResolvedValue('401654321');
      fetchGameSummary.mockReturnValue(new Promise(() => {})); // never resolves

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.eventId).toBe('401654321');
      });

      // Without summary data, defaults to pregame
      expect(result.current.gameStatus).toBe('pregame');
    });
  });

  describe('Consecutive error tracking', () => {
    it('resets consecutiveErrors to 0 on successful fetch', async () => {
      fetchScoreboard.mockResolvedValue('401654321');
      fetchGameSummary.mockResolvedValue({ header: {} });
      normalizeGameData.mockReturnValue(makeNormalized());

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.eventId).toBe('401654321');
      });

      expect(result.current.consecutiveErrors).toBe(0);
    });

    it('increments consecutiveErrors when summary fetch fails', async () => {
      fetchScoreboard.mockResolvedValue('401654321');
      fetchGameSummary.mockRejectedValue(new Error('Network error'));

      const { useGameData } = await import('../hooks/useGameData');
      const { result } = renderHook(() => useGameData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.consecutiveErrors).toBeGreaterThanOrEqual(1);
    });
  });
});

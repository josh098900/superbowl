import { useQuery } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import {
  fetchScoreboard,
  fetchGameSummary,
  normalizeGameData,
  getPollingInterval,
} from '../utils/espnApi';

/**
 * Custom hook that manages all ESPN API communication for the Super Bowl LX dashboard.
 *
 * - Discovers the event ID via the Scoreboard endpoint
 * - Polls the Summary endpoint with dynamic refetchInterval based on game status
 * - Normalizes raw ESPN data into typed models
 * - Tracks consecutive errors for error banner logic
 * - Accumulates win probability data points across polls
 */
export function useGameData() {
  const consecutiveErrorsRef = useRef(0);
  const winProbAccumulatorRef = useRef([]);

  // Step 1: Discover the Super Bowl event ID
  const scoreboardQuery = useQuery({
    queryKey: ['scoreboard'],
    queryFn: fetchScoreboard,
    staleTime: Infinity,
    retry: 2,
  });

  const eventId = scoreboardQuery.data ?? null;

  // Step 2: Poll the game summary once we have an event ID
  const summaryQuery = useQuery({
    queryKey: ['gameSummary', eventId],
    queryFn: () => fetchGameSummary(eventId),
    enabled: !!eventId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      const normalized = normalizeGameData(data);
      return getPollingInterval(normalized.gameStatus);
    },
  });

  // Normalize the raw summary data
  const normalized = useMemo(() => {
    if (!summaryQuery.data) return null;
    return normalizeGameData(summaryQuery.data);
  }, [summaryQuery.data]);

  // Track consecutive errors: increment on error, reset on success
  if (summaryQuery.isError) {
    consecutiveErrorsRef.current += 1;
  } else if (summaryQuery.isSuccess && summaryQuery.data) {
    consecutiveErrorsRef.current = 0;
  }

  // Accumulate win probability data points (append new, never remove)
  if (normalized?.winProbability?.length) {
    const existing = winProbAccumulatorRef.current;
    const existingIds = new Set(existing.map((p) => p.gameTime));
    const newPoints = normalized.winProbability.filter(
      (p) => !existingIds.has(p.gameTime)
    );
    if (newPoints.length > 0) {
      winProbAccumulatorRef.current = [...existing, ...newPoints];
    }
  }

  const defaultScores = {
    home: { name: 'Home', abbreviation: 'HOM', score: 0, logo: '' },
    away: { name: 'Away', abbreviation: 'AWY', score: 0, logo: '' },
  };

  const defaultClock = { quarter: 0, timeRemaining: '0:00', possession: null };

  const defaultPlayerStats = {
    qb: {
      home: { name: 'N/A', team: '', stats: {} },
      away: { name: 'N/A', team: '', stats: {} },
    },
    wr: {
      home: { name: 'N/A', team: '', stats: {} },
      away: { name: 'N/A', team: '', stats: {} },
    },
    rb: {
      home: { name: 'N/A', team: '', stats: {} },
      away: { name: 'N/A', team: '', stats: {} },
    },
  };

  const defaultTeamStats = {
    home: {
      totalYards: 0, firstDowns: 0, turnovers: 0,
      thirdDownPct: '0%', redZonePct: '0%', timeOfPossession: '0:00', sacks: 0,
    },
    away: {
      totalYards: 0, firstDowns: 0, turnovers: 0,
      thirdDownPct: '0%', redZonePct: '0%', timeOfPossession: '0:00', sacks: 0,
    },
  };

  return {
    eventId,
    gameStatus: normalized?.gameStatus ?? 'pregame',
    scores: normalized?.scores ?? defaultScores,
    clock: normalized?.clock ?? defaultClock,
    plays: normalized?.plays ?? [],
    playerStats: normalized?.playerStats ?? defaultPlayerStats,
    teamStats: normalized?.teamStats ?? defaultTeamStats,
    winProbability: winProbAccumulatorRef.current,
    currentDrive: normalized?.currentDrive ?? null,
    quarterScores: normalized?.quarterScores ?? { quarters: [] },
    isLoading: scoreboardQuery.isLoading || summaryQuery.isLoading,
    isError: scoreboardQuery.isError || summaryQuery.isError,
    consecutiveErrors: consecutiveErrorsRef.current,
  };
}

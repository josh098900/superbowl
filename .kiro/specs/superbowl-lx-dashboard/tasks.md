# Implementation Plan: Super Bowl LX Live Dashboard

## Overview

Build the dashboard incrementally: project scaffolding → data layer (API + normalization + mock data) → core components (LiveScore, PlayByPlay, PlayerStats) → enhanced components (WinProbability, TeamStats, DriveTracker) → polish components (QuarterBreakdown, PredictionCard, PropTracker) → responsive layout and error handling → final wiring and integration.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Vite + React project with TailwindCSS
  - Install dependencies: `recharts`, `axios`, `@tanstack/react-query`, `fast-check`, `@testing-library/react`, `vitest`, `jsdom`
  - Configure TailwindCSS with the dark theme colors (#0f172a background, team colors, gold accent)
  - Set up Vitest config with jsdom environment
  - Create the directory structure: `src/components/`, `src/hooks/`, `src/utils/`, `src/mocks/`, `src/__tests__/`
  - Create `src/main.jsx` with QueryClientProvider wrapping `App`
  - _Requirements: 12.1, 12.2, 12.3, 13.1_

- [x] 2. ESPN API utility and data normalization
  - [x] 2.1 Create `src/utils/espnApi.js` with `fetchScoreboard()`, `fetchGameSummary(eventId)`, and `normalizeGameData(rawData)`
    - `fetchScoreboard` hits the Scoreboard endpoint, finds the Super Bowl event by name, returns the event ID
    - `fetchGameSummary` hits the Summary endpoint with the event ID
    - `normalizeGameData` transforms raw ESPN JSON into the typed data models (TeamScores, GameClock, Play[], PlayerStatsData, TeamStatsData, WinProbPoint[], DriveData, QuarterScoreData)
    - Export a `getPollingInterval(gameStatus)` helper that returns 5000, 30000, or false
    - _Requirements: 1.1, 1.2, 1.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Create mock data files
    - Create `src/mocks/mockScoreboard.json` replicating ESPN Scoreboard response with a Super Bowl LX event
    - Create `src/mocks/mockSummary.json` replicating ESPN Summary response with realistic game data (scores, plays, player stats, team stats, win probability, drive data)
    - _Requirements: 13.1_

  - [x] 2.3 Implement mock data toggle in `espnApi.js`
    - Read `VITE_USE_MOCK_DATA` environment variable
    - When set, `fetchScoreboard` and `fetchGameSummary` return mock data instead of calling ESPN
    - _Requirements: 13.2, 13.3_

  - [x] 2.4 Write property test: Event ID extraction (Property 1)
    - **Property 1: Event ID extraction from any scoreboard response**
    - Generate random arrays of event objects with `fast-check`. Some contain "Super Bowl" in the name, some don't.
    - Verify: if exactly one event has "Super Bowl" in name, the correct ID is returned; if none do, an error is signaled.
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.5 Write property test: Polling interval (Property 3)
    - **Property 3: Polling interval matches game status**
    - Generate random GameStatus values with `fast-check`.
    - Verify: q1/q2/q3/q4/overtime → 5000, pregame/halftime → 30000, final → false.
    - **Validates: Requirements 2.4, 2.5, 2.6**

  - [x] 2.6 Write property test: Normalization integrity (Property 17)
    - **Property 17: ESPN API normalization preserves data integrity**
    - Generate mock ESPN-like response structures with `fast-check`.
    - Verify: normalized output scores match raw input scores, play descriptions match raw input descriptions.
    - **Validates: Requirements 1.1, 2.1, 3.3**

- [-] 3. Custom hook: useGameData
  - [x] 3.1 Create `src/hooks/useGameData.js`
    - Use React Query to first fetch the event ID via `fetchScoreboard()`
    - Once event ID is available, poll `fetchGameSummary(eventId)` with dynamic `refetchInterval` from `getPollingInterval(gameStatus)`
    - Normalize the response via `normalizeGameData`
    - Track `consecutiveErrors` (increment on error, reset on success)
    - Accumulate `winProbability` data points across polls (append new points, never remove)
    - Return the full `UseGameDataReturn` shape
    - _Requirements: 1.1, 1.3, 2.4, 2.5, 2.6, 5.2, 14.1, 14.2, 14.3_

  - [x] 3.2 Write unit tests for useGameData
    - Test event ID discovery with mock scoreboard data
    - Test polling interval changes based on game status
    - Test consecutive error tracking
    - _Requirements: 1.1, 2.4, 2.5, 2.6, 14.3_

- [x] 4. Checkpoint - Core data layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Core components: LiveScore, PlayByPlay, PlayerStats
  - [x] 5.1 Create `src/components/LiveScore.jsx`
    - Render team logos (ESPN logo URLs from data), team names, scores in large font
    - Render current quarter and time remaining
    - Render Game_Status badge (Pregame, Q1, Halftime, Final, etc.)
    - Full-width layout at top of dashboard
    - Use Seahawks/Patriots team colors for respective sides
    - _Requirements: 2.1, 2.2, 2.3, 12.2_

  - [x] 5.2 Write property test: LiveScore renders all fields (Property 2)
    - **Property 2: LiveScore renders all game state fields**
    - Generate random TeamScores, GameClock, GameStatus with `fast-check`.
    - Verify: rendered output contains both team names, both scores, quarter, time remaining, and game status.
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 5.3 Create `src/components/PlayByPlay.jsx`
    - Render scrollable list of plays, limited to most recent 15
    - Each play shows description, down & distance, yard line, quarter/clock
    - Scoring plays highlighted with gold (#fbbf24) background/border
    - Auto-scroll to newest play using a ref
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.4 Write property tests: PlayByPlay (Properties 4, 5, 6)
    - **Property 4: Play feed limited to 15 most recent**
    - Generate random arrays of 0–50 Play objects. Verify at most 15 rendered, and they are the most recent.
    - **Validates: Requirements 3.1**
    - **Property 5: Play rendering includes all required fields**
    - Generate random Play objects. Verify description, down, distance, yard line appear.
    - **Validates: Requirements 3.3**
    - **Property 6: Scoring plays receive gold highlight**
    - Generate random Play objects with random isScoring. Verify gold styling matches isScoring.
    - **Validates: Requirements 3.4**

  - [x] 5.5 Create `src/components/PlayerStats.jsx`
    - Render three comparison cards: QB, WR, RB
    - Each card shows two players side-by-side with position-specific stats
    - QB: Comp/Att, Yards, TDs, INTs, Rating
    - WR: Rec, Yards, TDs, Targets
    - RB: Carries, Yards, TDs, YPC
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.6 Write property test: PlayerStats (Property 7)
    - **Property 7: Player stats cards show all required stats**
    - Generate random PlayerStatsData with `fast-check`. Verify all stat categories appear for each position.
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 6. Checkpoint - Core components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Enhanced components: WinProbability, TeamStats, DriveTracker
  - [ ] 7.1 Create `src/components/WinProbability.jsx`
    - Render Recharts LineChart with two lines
    - X-axis: game time, Y-axis: win percentage 0–100
    - Seahawks line: #69BE28, Patriots line: #C60C30
    - Dark theme chart styling
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ] 7.2 Create `src/components/TeamStats.jsx`
    - Render total yards, first downs, turnovers, 3rd down %, red zone %, time of possession
    - Side-by-side comparison layout with team colors
    - _Requirements: 6.1, 6.2_

  - [ ] 7.3 Create `src/components/DriveTracker.jsx`
    - When drive is active: show play count, yards, time, down/distance, field position
    - When drive is complete: show drive outcome
    - When no drive data: show placeholder
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 7.4 Write property tests: TeamStats and DriveTracker (Properties 9, 10, 11)
    - **Property 9: Team stats display all required fields**
    - Generate random TeamStatsData. Verify all stat fields appear for both teams.
    - **Validates: Requirements 6.1, 6.2**
    - **Property 10: Active drive displays all required info**
    - Generate random DriveData with isActive=true. Verify play count, yards, time, down, distance, field position appear.
    - **Validates: Requirements 7.1, 7.2**
    - **Property 11: Completed drive shows outcome**
    - Generate random DriveData with isActive=false and non-null result. Verify outcome text appears.
    - **Validates: Requirements 7.3**

- [ ] 8. Polish components: QuarterBreakdown, PredictionCard, PropTracker
  - [ ] 8.1 Create `src/components/QuarterBreakdown.jsx`
    - Render scoring by quarter for each team
    - Show quarter number and both teams' scores per quarter
    - _Requirements: 8.1_

  - [ ] 8.2 Create `src/components/PredictionCard.jsx`
    - Display hardcoded predictions: Final score (SEA 27, NE 20), MVP (JSN), Total points (47), First TD (Charbonnet)
    - When game is not pregame, show actual values alongside predictions
    - Visual indicators for correct (green) / incorrect (red) / pending (gray)
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 8.3 Create `src/components/PropTracker.jsx`
    - Track over/under 47.5 total points, longest play, total sacks, total turnovers
    - Compute values from game data props
    - _Requirements: 10.1, 10.2_

  - [ ]* 8.4 Write property tests: QuarterBreakdown, PredictionCard, PropTracker (Properties 12, 14, 15)
    - **Property 12: Quarter breakdown shows per-quarter scores**
    - Generate random QuarterScoreData. Verify each quarter's scores appear.
    - **Validates: Requirements 8.1**
    - **Property 14: Prediction tracking indicators**
    - Generate random Prediction objects with isCorrect true/false/null. Verify correct indicator rendering.
    - **Validates: Requirements 9.3**
    - **Property 15: Prop trackers display all tracked values**
    - Generate random game data. Verify all four prop tracker values appear.
    - **Validates: Requirements 10.1**

- [ ] 9. App layout, responsive design, and error handling
  - [ ] 9.1 Create `src/App.jsx`
    - Wire `useGameData` hook
    - Pass data slices to all child components
    - Implement responsive grid layout with TailwindCSS: single column (<640px), 2-column (640–1024px), 3-column (≥1024px)
    - LiveScore spans full width at top
    - Middle section: WinProbability + DriveTracker (left), PlayByPlay (right)
    - Bottom: PlayerStats cards (3 columns)
    - Sidebar area: TeamStats, PredictionCard, QuarterBreakdown, PropTracker
    - _Requirements: 11.1, 11.2, 11.3, 12.1_

  - [ ] 9.2 Implement error handling UI
    - Show "Game not found" full-page message when event ID is null and not loading
    - Show subtle error indicator when `consecutiveErrors` is 1 or 2
    - Show prominent error banner when `consecutiveErrors` >= 3
    - _Requirements: 1.2, 14.1, 14.3_

  - [ ]* 9.3 Write property test: Error banner threshold (Property 16)
    - **Property 16: Error banner on consecutive failures**
    - Generate random consecutiveErrors counts (0–20) with `fast-check`. Verify banner visible when >= 3, hidden when < 3.
    - **Validates: Requirements 14.3**

- [ ] 10. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` with minimum 100 iterations per property
- Unit tests use Vitest + React Testing Library
- Mock data should be used during development (`VITE_USE_MOCK_DATA=true`)

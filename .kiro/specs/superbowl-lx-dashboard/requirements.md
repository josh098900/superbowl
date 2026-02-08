# Requirements Document

## Introduction

A real-time Super Bowl LX dashboard built with React + Vite, TailwindCSS, and ESPN's free API. The dashboard displays live scores, play-by-play, player stats, win probability, team stats, and pre-game predictions for the Seattle Seahawks vs. New England Patriots matchup on February 8, 2026 at 6:30 PM ET. The dashboard uses a dark theme with team-specific color accents and is fully responsive across mobile, tablet, and desktop viewports.

## Glossary

- **Dashboard**: The single-page React application that displays all Super Bowl LX game data
- **ESPN_API**: The unofficial ESPN API endpoints used to fetch live game data (no API key required)
- **Event_ID**: A unique identifier for the Super Bowl LX game event, retrieved from the ESPN scoreboard endpoint
- **Scoreboard_Endpoint**: `GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` — returns current scores and game status
- **Summary_Endpoint**: `GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={eventId}` — returns box score, team stats, player stats, play-by-play, and win probability
- **Polling_Interval**: The frequency at which the Dashboard fetches updated data from the ESPN_API
- **Game_Status**: One of Pregame, Q1, Q2, Halftime, Q3, Q4, Overtime, or Final
- **Win_Probability**: A percentage (0–100) representing each team's likelihood of winning at a given point in the game
- **Drive**: A continuous series of offensive plays by one team until possession changes
- **Play_By_Play**: A chronological feed of individual plays with descriptions, down/distance, and yard line
- **Mock_Data**: Sample ESPN_API response payloads used for development and testing before the live game
- **Prediction_Card**: A UI component that displays pre-game predictions alongside actual game results

## Requirements

### Requirement 1: Event ID Discovery

**User Story:** As a dashboard user, I want the application to automatically find the Super Bowl LX event, so that I do not need to manually configure any game identifiers.

#### Acceptance Criteria

1. WHEN the Dashboard starts, THE Dashboard SHALL fetch the Scoreboard_Endpoint and extract the Event_ID for the Super Bowl LX game
2. IF the Super Bowl LX game is not found in the scoreboard response, THEN THE Dashboard SHALL display an error message indicating the game was not found
3. WHEN the Event_ID is successfully extracted, THE Dashboard SHALL use the Event_ID for all subsequent Summary_Endpoint requests

### Requirement 2: Live Score Display

**User Story:** As a dashboard user, I want to see the current score prominently displayed, so that I can instantly know the game state.

#### Acceptance Criteria

1. THE Dashboard SHALL display team logos, team names, and current scores for both the Seattle Seahawks and New England Patriots
2. THE Dashboard SHALL display the current quarter and time remaining in the quarter
3. THE Dashboard SHALL display the current Game_Status (Pregame, Q1, Q2, Halftime, Q3, Q4, Overtime, or Final)
4. WHILE the Game_Status is not Final, THE Dashboard SHALL poll the Summary_Endpoint every 5 seconds and update the displayed score
5. WHILE the Game_Status is Pregame or Halftime, THE Dashboard SHALL poll the Summary_Endpoint every 30 seconds instead of every 5 seconds
6. WHEN the Game_Status changes to Final, THE Dashboard SHALL stop polling the Summary_Endpoint

### Requirement 3: Play-by-Play Feed

**User Story:** As a dashboard user, I want to see a scrolling feed of recent plays, so that I can follow the action in real time.

#### Acceptance Criteria

1. THE Dashboard SHALL display the most recent 15 plays in a scrollable feed
2. WHEN a new play is received from the Summary_Endpoint, THE Dashboard SHALL prepend the play to the feed and auto-scroll to show the newest play
3. THE Dashboard SHALL display each play with its description, down and distance, and yard line
4. WHEN a play results in a score, THE Dashboard SHALL visually highlight that play with a distinct style (gold accent color #fbbf24)

### Requirement 4: Player Stats Comparison

**User Story:** As a dashboard user, I want to see side-by-side player stat comparisons, so that I can evaluate individual performances.

#### Acceptance Criteria

1. THE Dashboard SHALL display a QB comparison card showing Sam Darnold (SEA) vs Drake Maye (NE) with completions/attempts, passing yards, touchdowns, interceptions, and passer rating
2. THE Dashboard SHALL display a WR comparison card showing Jaxon Smith-Njigba (SEA) vs DeMario Douglas (NE) with receptions, receiving yards, touchdowns, and targets
3. THE Dashboard SHALL display a RB comparison card showing Zach Charbonnet (SEA) vs Rhamondre Stevenson (NE) with carries, rushing yards, touchdowns, and yards per carry
4. WHEN updated player stats are received from the Summary_Endpoint, THE Dashboard SHALL refresh all player comparison cards with the latest data

### Requirement 5: Win Probability Chart

**User Story:** As a dashboard user, I want to see a win probability chart over time, so that I can visualize momentum shifts during the game.

#### Acceptance Criteria

1. THE Dashboard SHALL display a line chart with game time on the X-axis and win percentage (0–100) on the Y-axis
2. WHEN new Win_Probability data is received from the Summary_Endpoint, THE Dashboard SHALL append the data point to the chart
3. THE Dashboard SHALL use Seahawks team color (#69BE28) for the Seahawks win probability line and Patriots team color (#C60C30) for the Patriots win probability line
4. THE Dashboard SHALL display the chart using the Recharts library

### Requirement 6: Team Stats Comparison

**User Story:** As a dashboard user, I want to see aggregate team statistics side by side, so that I can compare overall team performance.

#### Acceptance Criteria

1. THE Dashboard SHALL display total yards, first downs, turnovers, third-down conversion percentage, and red zone percentage for both teams
2. THE Dashboard SHALL display time of possession for both teams
3. WHEN updated team stats are received from the Summary_Endpoint, THE Dashboard SHALL refresh the team stats display with the latest data

### Requirement 7: Drive Tracker

**User Story:** As a dashboard user, I want to see the current drive information, so that I can follow the active possession in detail.

#### Acceptance Criteria

1. WHILE a Drive is in progress, THE Dashboard SHALL display the current drive's play count, total yards gained, and elapsed time
2. WHILE a Drive is in progress, THE Dashboard SHALL display the current down, distance, and field position
3. WHEN a Drive ends, THE Dashboard SHALL display the drive outcome (touchdown, field goal, punt, turnover)

### Requirement 8: Quarter-by-Quarter Breakdown

**User Story:** As a dashboard user, I want to see scoring broken down by quarter, so that I can see which team dominated each period.

#### Acceptance Criteria

1. THE Dashboard SHALL display a scoring breakdown showing points scored by each team in each completed quarter
2. WHEN a quarter ends, THE Dashboard SHALL update the breakdown to include the completed quarter's scoring

### Requirement 9: Pre-Game Predictions vs Reality

**User Story:** As a dashboard user, I want to see pre-game predictions compared to actual results, so that I can track how accurate the predictions were.

#### Acceptance Criteria

1. THE Dashboard SHALL display pre-game predictions for final score (Seahawks 27, Patriots 20), MVP (Jaxon Smith-Njigba), total points (47), and first TD scorer (Zach Charbonnet)
2. WHILE the Game_Status is not Pregame, THE Dashboard SHALL display actual game results alongside each prediction
3. THE Dashboard SHALL visually indicate whether each prediction is tracking correctly or incorrectly as the game progresses

### Requirement 10: Prop Tracker

**User Story:** As a dashboard user, I want to track key prop bets during the game, so that I can follow fun side bets in real time.

#### Acceptance Criteria

1. THE Dashboard SHALL display trackers for: over/under 47.5 total points, longest play of the game, total sacks, and total turnovers
2. WHEN game stats are updated from the Summary_Endpoint, THE Dashboard SHALL update each prop tracker with current values

### Requirement 11: Responsive Layout

**User Story:** As a dashboard user, I want the dashboard to work on any device, so that I can follow the game from my phone, tablet, or desktop.

#### Acceptance Criteria

1. WHEN the viewport width is less than 640px (mobile), THE Dashboard SHALL stack all components vertically in a single column
2. WHEN the viewport width is between 640px and 1024px (tablet), THE Dashboard SHALL arrange components in a 2-column layout
3. WHEN the viewport width is 1024px or greater (desktop), THE Dashboard SHALL arrange components in a 3-column layout with the live score spanning the full width at the top

### Requirement 12: Dark Theme and Team Colors

**User Story:** As a dashboard user, I want a visually appealing dark-themed dashboard with team colors, so that the viewing experience matches the Super Bowl atmosphere.

#### Acceptance Criteria

1. THE Dashboard SHALL use a dark background color (#0f172a) for the main application background
2. THE Dashboard SHALL use Seahawks colors (Navy #002244, Action Green #69BE28) and Patriots colors (Navy #002244, Red #C60C30, Silver #B0B7BC) for team-specific elements
3. THE Dashboard SHALL use gold (#fbbf24) as the accent color for highlights and scoring plays

### Requirement 13: Mock Data Support

**User Story:** As a developer, I want to use mock ESPN API responses during development, so that I can build and test the dashboard before the live game.

#### Acceptance Criteria

1. THE Dashboard SHALL include mock data files that replicate the structure of ESPN_API Scoreboard_Endpoint and Summary_Endpoint responses
2. WHEN a configuration flag is set to use mock data, THE Dashboard SHALL load data from mock files instead of the ESPN_API
3. WHEN the configuration flag is set to use live data, THE Dashboard SHALL fetch data from the ESPN_API endpoints

### Requirement 14: API Error Handling

**User Story:** As a dashboard user, I want the dashboard to handle network failures gracefully, so that temporary API issues do not break the experience.

#### Acceptance Criteria

1. IF a request to the ESPN_API fails, THEN THE Dashboard SHALL display the most recently cached data and show a subtle error indicator
2. IF a request to the ESPN_API fails, THEN THE Dashboard SHALL retry the request on the next Polling_Interval
3. IF three consecutive requests to the ESPN_API fail, THEN THE Dashboard SHALL display a prominent error banner indicating connectivity issues

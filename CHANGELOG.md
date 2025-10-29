# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-01-29

### Added

- **Multi-Language Support**:
  - Separate language files in `src/messages/` folder
  - English (en) and Greek (el) language files included
  - Easy language switching via `LANGUAGE` environment variable
  - Language loader with automatic fallback to English
  - Support for adding more languages (Estonian, French, etc.)
  - All user-facing text centralized and separated from bot logic
  - System logs kept in English for developer convenience
  - **Button Bullying System** (`/bully` command):
  - Dynamic user targeting - Set which user to bully at runtime (admin only)
  - 3-click requirement before buttons work for the bullied user
  - Custom bully messages that include the user's display name
  - **Universal cooldown** - 30-minute cooldown after 3rd click applies across ALL buttons (not per-button)
  - Cooldown management:
    - `/bully cd` - Check active cooldown status with remaining time
    - `/bully cdreset` - Reset cooldown for the bullied user
  - Administrator permission required for all `/bully` commands
  - Subcommands:
    - `/bully set <user>` - Enable bullying for a specific user
    - `/bully remove` - Disable bullying
    - `/bully status` - Check who is currently being bullied
  - Personalized bully messages using username (without @ mention)
  - Public bully messages (everyone can see when someone is being trolled)
  - Works on all buttons: Watched, Want to Watch, Watch Party, Delete
  - Only one user can be bullied at a time
  - In-memory tracking with universal button press counter per user

### Fixed

- Forum tag limit enforcement (Discord's 5 tag maximum per post)
- Removed default movie tag (no longer using "ταινία" tag)
- Updated to use `clientReady` event instead of deprecated `ready` event
- Watched button now properly toggles (add/remove from watched list)
- Button label extraction uses messages object instead of hard-coded strings

### Changed

- **Watch Party System**:
  - Automatic "Organize Watch Party" button when interest threshold is reached
  - Dynamic interest counter on button (e.g., "Organize Watch Party (3 interested)")
  - Thread notifications with user tagging when threshold reached
  - Coordination message posted in forum thread with user mentions
  - Discord Scheduled Event creation with placeholder time (+7 days, configurable)
  - Prevention of duplicate watch parties for same movie
  - Prevention of duplicate threshold notifications (when users toggle watchlist status)
  - Configuration options for threshold, notice period, and features
  - Environment-aware threshold (1 for dev, 3 for production)
  - Smart button management: Trailer button hides when Watch Party button appears (Discord's 5 button limit)
- Watch party database table for tracking organized events
- Helper functions for watch party management (`getUsersWantingToWatch`, `watchPartyExists`, `createWatchParty`, `updateWatchParty`)
- Dynamic button rebuilding when users join/leave watchlist
- `buildMovieButtons()` helper function for conditional button display logic

### Refactored

- **Major Code Restructuring** - Semi-complete refactoring for maintainability:
  - Moved all source code to `src/` directory
  - Moved database files to `data/` directory (excluded from git)
  - Split `bot.js` into modular architecture
  - **New folder structure**:
    - `src/commands/` - Slash command handlers (`movie.js`, `mywatchlist.js`)
    - `src/events/` - Discord event handlers (`ready.js`, `interactionCreate.js`)
    - `src/handlers/` - Interaction handlers:
      - `autocomplete.js` - Movie search autocomplete
      - `buttons/` - Button interaction handlers with router
    - `src/utils/` - Utility functions (`buttonBuilder.js`, `commandRegistration.js`)
    - `src/services/` - External integrations and configuration:
      - `config.js` - Centralized configuration
      - `database.js` - SQLite database operations
      - `tmdb.js` - TMDB API integration
    - `src/messages/` - Language files with loader
- Updated all import paths to reflect new structure
- Updated `package.json` to run `src/bot.js`
- Updated `.gitignore` to exclude `data/` folder and `.DS_Store` files
- Updated `src/services/database.js` to use `data/` directory for database files
- Updated test imports in `tests/` to use new `src/services/` paths
- Updated GitHub Actions workflow to use `src/bot.js` path with PM2

## [1.0.0] - 2025-01-27

### Added

- Initial release of Discord Movie Bot
- `/movie` command to create movie discussion posts with TMDB autocomplete
- `/mywatchlist` command to view your watched movies and watchlist
- Interactive buttons:
  - "Watched" button to mark movies as watched
  - "Want to Watch" button to add movies to watchlist
  - "Delete Post" button with confirmation dialog (author only)
  - IMDB link button (when available)
  - Trailer link button (when available)
- SQLite database for persistent watchlist tracking
- Environment-based database selection (development/production)
- Rich movie embeds with:
  - Movie poster thumbnail
  - Release year, rating, runtime
  - Cast (top 5) and director
  - Genres
  - Plot description
- Automatic forum tag assignment based on movie genres
- Reaction-based rating system (1-5 stars)
- Toggle functionality for watched/watchlist buttons
- User engagement counters showing how many people watched/want to watch
- TMDB and IMDB integration

### Technical

- Discord.js v14 integration
- TMDB API integration with external_ids for IMDB linking
- better-sqlite3 for database operations
- Environment variable configuration
- Secure .env file structure

## Version History

[Unreleased]: https://github.com/argyee/plot-twist/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/argyee/plot-twist/releases/tag/v1.0.0

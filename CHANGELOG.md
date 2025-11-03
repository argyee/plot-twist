# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-03

### Added

- **Winston Logger Integration** (`src/utils/logger.js`):
    - Implemented industry-standard logging with Winston
    - Structured logging with metadata support
    - Different log levels: debug, info, warn, error
    - Separate log files for errors and combined logs in production
    - Colored, human-readable console output in development
    - JSON logging in production for log aggregation
    - Configurable log level via `LOG_LEVEL` environment variable
    - Replaced all 10 TODO comments requesting proper logging utility

- **Modal Builder Utility** (`src/utils/mediaRequestModal.js`):
    - New shared utility for building request modals
    - Eliminates code duplication between `/request` command and request button handler
    - Centralized modal creation with consistent UX
    - Support for both quick requests and button-triggered requests

### Changed

- **Complete Message Internationalization**:
    - Migrated all remaining hardcoded user-facing messages to `messages/en.js` and `messages/el.js`
    - Added new message sections:
        - `request` - Request command and modal messages
        - `myRequests` - My requests command messages
        - `bully` - All bully command messages
        - `overseerrCommand` - Overseerr admin command descriptions
        - `errors` - Generic error messages
        - `movieEmbed` - Movie embed field labels and footer text
    - Updated 9 files to use centralized messages:
        - `src/commands/request.js`
        - `src/commands/bully.js`
        - `src/commands/overseerr.js`
        - `src/commands/myrequests.js`
        - `src/commands/mywatchlist.js`
        - `src/commands/movie.js`
        - `src/handlers/buttons/request.js`
        - `src/handlers/buttons/delete.js`
        - `src/handlers/buttons/index.js`
        - `src/events/interactionCreate.js`
    - 100% of user-facing messages now use the i18n system

### Improved

- **Comprehensive Logging Infrastructure**:
    - **Updated 12 files** with Winston logger integration:
        - All 5 button handlers: `watchlist.js`, `watched.js`, `watchParty.js`, `delete.js`, `index.js`
        - Button request handler: `handlers/buttons/request.js`
        - All 3 services: `database.js`, `tmdb.js`, `bullying.js`
        - Commands: `request.js`, `mywatchlist.js`
        - Handler: `autocomplete.js`
        - Messages loader: `messages/index.js` (with fallback)
    - **Replaced 33 console.log/error/warn statements** with structured logging
    - **Rich contextual metadata** added to all logs:
        - User IDs, usernames, and tags for tracking
        - Movie IDs, titles, and years for context
        - Request details (4K quality, Overseerr user IDs)
        - Error messages with full stack traces
        - Watch party details (threshold, interested users count)
        - Bullying system events (press counts, cooldown status)
        - Database operation results (wasAdded, wasRemoved flags)
        - TMDB API call results (search counts, availability)
    - **Appropriate log levels** used throughout:
        - `debug` - Detailed operational flow (button presses, status checks, queries)
        - `info` - Important events (watch party creation, movie requests, account linking)
        - `warn` - Potential issues (language fallback, Overseerr not configured)
        - `error` - Errors with full context and stack traces
        - `success` - Major milestones (database init, watch party created, movie posts)
    - **Environment-aware logging**:
        - Development: Colored console output with human-readable format
        - Production: JSON logs with timestamps for log aggregation
        - Configurable via `LOG_LEVEL` environment variable
    - **Complete traceability**: Every user interaction, database operation, and API call now logged
    - Only 1 intentional console.log remains (fallback in messages/index.js)

- **Test Infrastructure Improvements**:
    - **Global logger mocking** via `tests/setup.js`
    - **Cleaner test output** - No log spam during test execution
    - **Faster tests** - No file I/O for logging during test runs
    - **All 171 tests passing** with logger mocking in place
    - Test setup configured in `jest.config.js` via `setupFilesAfterEnv`
    - **New test file**: `tests/mediaRequestModal.test.js` (12 tests for modal builder utility)

- **Code Quality**:
    - Eliminated modal creation code duplication (~15 lines removed)
    - Better separation of concerns with dedicated modal builder
    - Easier maintenance and testing
    - Consistent modal UX across all request flows
    - All messages now translatable (full Greek support)
    - Removed all TODO comments for logging utility (10 resolved)
    - Improved debugging capabilities with structured logs

- **Autocomplete Optimization** (`src/handlers/autocomplete.js`):
    - Increased minimum query length from 2 to 3 characters
    - Moved length check before logger call to reduce log spam
    - Reduces unnecessary TMDB API calls for very short queries

## [1.1.3] - 2025-10-30

### Added

- **Overseerr Integration for Plex Requests**:
    - Replace Trailer button with dynamic "Request on Plex" button
    - Button shows movie availability status (🟢 Available / 🟡 Pending / 📥 Request)
    - 4K quality toggle when requesting movies
    - Admin commands for account linking (`/overseerr link`, `unlink`, `status`, `list`)
    - User command to view requests (`/myrequests`)
    - **Quick request command (`/request`)** - Request movies without creating forum posts
        - TMDB autocomplete for movie search
        - 4K quality toggle via modal
        - Direct request submission to Overseerr
        - Ephemeral responses (only visible to requester)
    - Discord users linked to Overseerr/Plex accounts via database
    - Full English and Greek localization for all features
    - Integration with existing button bullying system
- **Comprehensive test suite for Overseerr integration** (~60 new tests):
    - Complete coverage of Overseerr service functions (getMovieStatus, createMovieRequest, etc.)
    - Database Overseerr link operations tests
    - Button state tests for all Overseerr button variations
    - All 159 tests passing

### Changed

- Removed Trailer button from movie posts (replaced with Request button)
- Updated button builder logic to accommodate Overseerr status
- Movie posts now show availability status in embed footer when Overseerr is configured
- Commented out verbose debug logs (prepared for future logging utility)
- Improved database function return types (getOverseerLink returns null, unlinkOverseerAccount returns true)

## [1.1.2] - 2025-10-30

### Added

- **Dynamic Bot Status Display**:
    - Bot presence now shows "Movie Nerd".
    - Automatically updates to "Movie Nerd and {username}'s bully" when a user is set as the bully target
    - Real-time status updates when `/bully set` or `/bully remove` commands are used
    - Fetches and displays the bullied user's display name from Discord

## [1.1.1] - 2025-01-29

### Added

- **Comprehensive test suite for Priority 1 components** (Services & Utilities)
    - `tests/database.test.js` - Complete test coverage for all 10 database functions
        - Tests watchlist operations (add, remove, check, get)
        - Tests movie queries and status counts
        - Tests watch party operations (create, update, check existence)
        - Uses in-memory SQLite (`:memory:`) for fast, isolated testing
        - 32 test cases covering edge cases and error scenarios
    - `tests/bullying.test.js` - Comprehensive cooldown and state management tests
        - Tests universal button press tracking across all button types
        - Tests 30-minute cooldown logic with time mocking
        - Tests first/second/third press flow
        - Tests cooldown expiry and reset functionality
        - 20+ test cases including boundary conditions
    - `tests/tmdb.test.js` - TMDB API integration tests with mocked axios
        - Tests `searchMovies` with various inputs and error handling
        - Tests `getMovieDetails` data transformation
        - Tests handling of missing optional fields (cast, director, trailer, poster)
        - Tests top-5 cast limit and YouTube trailer filtering
        - 25+ test cases covering API success and failure scenarios
    - `tests/buttonBuilder.test.js` - Dynamic button creation logic tests
        - Tests basic button creation (Watched, Want to Watch, Delete)
        - Tests optional button logic (IMDB, Trailer)
        - Tests watch party button threshold logic (3+ interested)
        - Tests 5-button limit constraint (Trailer hides when Watch Party shows)
        - Tests correct customId format and button styles
        - 30+ test cases covering all button combinations
    - ~40-50% code coverage achieved for critical business logic

### Fixed

- **Test suite reliability improvements**
    - Fixed TMDB tests by properly mocking `dotenv` to prevent real `.env` file from loading
    - Fixed bullying service cooldown boundary condition test
    - All 106 tests now pass consistently (32 database, 30 bullying, 18 TMDB, 20 button builder, 6 config)

### Changed

- **CI/CD Pipeline Improvements**
    - Combined separate CI and Deploy workflows into unified `ci-cd.yml` pipeline
    - Added `paths-ignore` to skip deployment for documentation-only changes
        - Prevents unnecessary bot restarts when updating README, CHANGELOG, docs
        - Only deploys when actual code changes (src/, package.json, etc.)
    - Deploy job now depends on tests passing (no deployment if tests fail)
    - Added test coverage reporting with Codecov integration (optional)
    - Added Discord webhook notifications for all pipeline events:
        - Test success/failure notifications
        - Deployment started/success/failure notifications
        - Includes commit message, author, and links to failed runs
    - Setup guide created at `DISCORD_WEBHOOK_SETUP.md`
- **Database test environment improvements**
    - Test database now uses in-memory SQLite (`:memory:`) instead of file-based database
    - Significantly faster test execution (no disk I/O)
    - Automatic cleanup (no test database files to manage)
    - Better test isolation and consistency
- **Improved JSDoc type annotations** for better IDE support and type safety
    - Updated all interaction handlers to use specific Discord.js v14 interaction types
    - Slash command handlers now use `ChatInputCommandInteraction` instead of generic `Interaction`
    - Autocomplete handler now uses `AutocompleteInteraction`
    - Button handlers now use `ButtonInteraction`
    - Added proper type imports from `discord.js` to all handler files
    - Provides better autocomplete and catches type errors earlier in development

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
- Helper functions for watch party management (`getUsersWantingToWatch`, `watchPartyExists`, `createWatchParty`,
  `updateWatchParty`)
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

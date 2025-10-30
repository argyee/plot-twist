# Discord Movie Bot

A Discord bot that creates movie discussion posts in a forum channel with TMDB integration, interactive buttons, and user watchlist tracking.

## Features

- 🎬 Search and create movie posts with autocomplete
- 📊 Rich embeds with movie info (cast, director, rating, runtime, etc.)
- 🔘 Interactive buttons:
  - Mark movies as "Watched" or "Want to Watch"
  - Quick links to IMDB
  - **Request on Plex** - Request movies through Overseerr with 4K support
  - Delete posts (author only with confirmation)
  - **Watch Party Organization** - Coordinate movie nights with friends!
- 💾 SQLite database to track user watchlists
- 📋 View your movie lists with `/mywatchlist` command
- 🏷️ Automatic genre tagging for forum organization
- ⭐ Reaction-based rating system
- 🎉 **Watch Party System**:
  - Automatic "Organize Watch Party" button when threshold reached
  - Thread notifications when interest threshold is met
  - Creates dedicated thread for coordination
  - Creates Discord Scheduled Event
  - Dynamic interest counter
  - Prevents duplicate watch parties
- 😈 **Button Bullying System**:
  - Set which user to bully dynamically with `/bully` commands
  - Bullied users must click ANY buttons 3 times before they work
  - Personalized bully messages with username
  - Universal 30-minute cooldown across ALL buttons
  - Cooldown management (check and reset)
  - Public messages so everyone can see the trolling
  - See [BULLYING_SETUP.md](BULLYING_SETUP.md) for details
- 🎬 **Overseerr Integration** (Optional):
  - Request movies directly from Discord to your Plex server
  - Shows real-time availability status (Available/Pending/Not Available)
  - 4K quality toggle when requesting
  - Admin commands to link Discord users to Overseerr accounts
  - View and manage your requests with `/myrequests`
  - Automatic status updates in movie post embeds

 ## Preview

  <img width="1966" height="1272" alt="CleanShot 2025-10-29 at 17 58 36@2x" src="https://github.com/user-attachments/assets/0d18cf79-9675-482f-81cf-ea3aacd27764" />
  <img width="1546" height="1156" alt="CleanShot 2025-10-29 at 17 57 37@2x" src="https://github.com/user-attachments/assets/66e24f07-44a2-4130-b925-3c1e6ce424da" />




## Prerequisites

- Node.js (v16 or higher)
- A Discord account and server with admin permissions
- Discord Bot Token (instructions below)
- TMDB API Key (instructions below)

## Setup Guide

### 1. Get a Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under "Token", click "Reset Token" and copy it (you'll need this for `.env`)
5. Under "Privileged Gateway Intents", enable:
   - Server Members Intent
   - Message Content Intent
6. Go to "OAuth2" → "URL Generator"
7. Select scopes: `bot`, `applications.commands`
8. Select bot permissions:
   - Send Messages
   - Create Public Threads
   - Send Messages in Threads
   - Embed Links
   - Attach Files
   - Read Message History
   - Add Reactions
   - Use Slash Commands
9. Copy the generated URL and open it in your browser to invite the bot to your server

### 2. Get a TMDB API Key

1. Create an account at [The Movie Database](https://www.themoviedb.org/signup)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (choose "Developer" option)
4. Fill out the form with your project details
5. Copy your API Key (v3 auth)

### 3. Create a Forum Channel

1. In your Discord server, create a new Forum Channel
2. Right-click the channel → Copy ID (enable Developer Mode in Discord settings if you don't see this)
3. Add forum tags for genres (recommended):
   - Action, Comedy, Drama, Horror, Sci-Fi, Thriller, etc.
   - Posts will be automatically tagged based on movie genres

## Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd discord_moviebot
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
NODE_ENV=development
LANGUAGE=en
DISCORD_TOKEN=your_discord_bot_token
TMDB_API_KEY=your_tmdb_api_key
MOVIE_FORUM_CHANNEL_ID=your_forum_channel_id
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

# Optional: Overseerr Integration
OVERSEERR_URL=http://localhost:5055
OVERSEERR_API_KEY=your_overseerr_api_key
```

4. Run the bot

```bash
npm start
```

Or directly with Node:

```bash
node src/bot.js
```

## Commands

### User Commands

- `/movie [title]` - Create a movie discussion post (with autocomplete)
- `/mywatchlist` - View your watched movies and watchlist
- `/request [title]` - Quick request a movie on Plex without creating a post (requires Overseerr setup)
- `/myrequests` - View your Overseerr movie requests (requires Overseerr setup)

### Admin Commands

- `/bully set <user>` - Enable button bullying for a specific user (requires Administrator permission)
- `/bully remove` - Disable bullying (requires Administrator permission)
- `/bully status` - Check who is currently being bullied (requires Administrator permission)
- `/bully cd` - Check active cooldowns for the bullied user (requires Administrator permission)
- `/bully cdreset` - Reset all cooldowns for the bullied user (requires Administrator permission)
- `/overseerr link <user> <identifier>` - Link a Discord user to their Overseerr account (requires Administrator permission)
- `/overseerr unlink <user>` - Unlink a Discord user from Overseerr (requires Administrator permission)
- `/overseerr status` - Check Overseerr connection status (requires Administrator permission)
- `/overseerr list` - List all linked accounts (requires Administrator permission)

## Button Interactions

When a movie post is created, users can:

- Click **Watched** to mark the movie as watched (adds to your list + reaction)
- Click **Want to Watch** to add to your watchlist (adds to your list + reaction)
- Click again to remove from watchlist (toggle functionality)
- Click **IMDB** to open the movie on IMDB
- Click **Request on Plex** to request the movie through Overseerr (shows status if already available/requested)
- Click **Delete Post** (author only) to remove the post with confirmation
- Click **Organize Watch Party** (appears when enough people are interested) to coordinate a movie night

## Watch Party System

When enough people click "Want to Watch" on a movie (configurable threshold), the bot enables watch party coordination:

### How It Works:

1. **Interest Building**: Users click "Want to Watch" on a movie post
2. **Threshold Reached**: When the configured number of people express interest:
   - "Organize Watch Party" button appears automatically (Trailer button is hidden due to Discord's 5 button limit)
   - Button shows current interest count (e.g., "Organize Watch Party (3 interested)")
   - Bot posts a notification in the movie thread tagging all interested users
   - Button count updates dynamically as more people join
3. **Organization**: Anyone who expressed interest can click the button to:
   - Post a coordination message in the movie's forum thread
   - Tag all interested users
   - Create a Discord Scheduled Event (with placeholder date +7 days)
   - Provide coordination questions (timing, platform, preferences)
4. **Coordination**: Users discuss and finalize details in the thread
5. **Prevention**: Once organized, the button is removed to prevent duplicates (Trailer button reappears)

### Configuration

Watch party settings can be adjusted in `src/config.js`:

```javascript
watchParty: {
  threshold: 3,                 // Min people needed (1 for dev, 3+ for production)
  placeholderEventHours: 168,   // Placeholder event time (168 = 7 days)
  eventDurationHours: 3,        // Default event duration
  dynamicCount: true,           // Update button count as people join
  preventDuplicates: true,      // Remove button after organization
  trackConfirmedAttendees: true // Track confirmed attendance via reactions
}
```

**Note**: The scheduled event is created with a **placeholder time 7 days in the future**. The event description clearly indicates this is a placeholder and users should edit the event after coordinating the actual date/time in the thread.

**Note**: The threshold automatically adjusts based on `NODE_ENV`:

- **Development**: 1 person (for easy testing)
- **Production**: 3+ people (configurable)

## Database

The bot uses SQLite to store user watchlists in the `data/` directory:

- **Development**: `data/movies_dev.db` (local testing)
- **Production**: `data/movies.db` (production server)

Database selection is controlled by the `NODE_ENV` environment variable. The `data/` directory is automatically created when the bot starts and is excluded from git via `.gitignore`.

## Testing

Run tests with:

```bash
npm test
```

Run tests in watch mode (auto-rerun on changes):

```bash
npm run test:watch
```

The project uses Jest for testing. Tests are located in the `tests/` directory.

## Deployment

For production deployment:

1. Set up your production environment
2. Update `.env` with production values:

```env
NODE_ENV=production
DISCORD_TOKEN=your_production_bot_token
MOVIE_FORUM_CHANNEL_ID=your_production_channel_id
```

3. Start the bot with a process manager (e.g., PM2)

```bash
pm2 start src/bot.js --name discord-moviebot
```

## Project Structure

```
discord_moviebot/
├── src/                    # Source code
│   ├── bot.js              # Main entry point
│   ├── commands/           # Slash command handlers
│   │   ├── movie.js        # /movie command
│   │   ├── mywatchlist.js  # /mywatchlist command
│   │   ├── request.js      # /request command (quick Plex requests)
│   │   ├── myrequests.js   # /myrequests command
│   │   ├── bully.js        # /bully command
│   │   └── overseerr.js    # /overseerr command
│   ├── events/             # Discord event handlers
│   │   ├── ready.js        # Bot ready event
│   │   └── interactionCreate.js  # Interaction router
│   ├── handlers/           # Interaction handlers
│   │   ├── autocomplete.js # Movie search autocomplete
│   │   └── buttons/        # Button interaction handlers
│   │       ├── index.js    # Button router
│   │       ├── watched.js  # Watched button handler
│   │       ├── watchlist.js # Watchlist button handler
│   │       ├── watchParty.js # Watch party button handler
│   │       ├── request.js  # Overseerr request handler
│   │       └── delete.js   # Delete button handlers
│   ├── utils/              # Utility functions
│   │   ├── buttonBuilder.js      # Dynamic button creation
│   │   └── commandRegistration.js # Slash command registration
│   ├── services/           # External integrations & config
│   │   ├── config.js       # Configuration (genres, emojis, settings)
│   │   ├── database.js     # SQLite database operations
│   │   ├── tmdb.js         # TMDB API integration
│   │   ├── overseerr.js    # Overseerr API integration
│   │   └── bullying.js     # Button bullying system
│   └── messages/           # Language files
│       ├── index.js        # Language loader
│       ├── en.js           # English messages
│       └── el.js           # Greek messages (Ελληνικά)
├── data/                   # Database files (not in git)
│   ├── movies_dev.db       # Development database
│   └── movies.db           # Production database
├── tests/                  # Jest tests
│   ├── config.test.js
│   └── database.test.js
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── jest.config.js          # Jest configuration
├── README.md               # This file
└── CHANGELOG.md            # Version history
```

### Code Organization

The bot follows a modular architecture with clear separation of concerns:

- **Entry Point** ([src/bot.js](src/bot.js)) - Minimal file that initializes the client and registers event handlers
- **Events** ([src/events/](src/events/)) - Handles Discord events (ready, interactionCreate)
- **Commands** ([src/commands/](src/commands/)) - Each slash command in its own file
- **Handlers** ([src/handlers/](src/handlers/)) - Processes different interaction types (autocomplete, buttons)
- **Utils** ([src/utils/](src/utils/)) - Shared utility functions and builders
- **Services** ([src/services/](src/services/)) - External integrations, data management, and configuration
  - [config.js](src/services/config.js) - Centralized configuration
  - [database.js](src/services/database.js) - SQLite database operations
  - [tmdb.js](src/services/tmdb.js) - TMDB API integration
- **Messages** ([src/messages/](src/messages/)) - Internationalization (i18n) support

## Language & Translation

The bot supports multiple languages through separate language files.

### Switching Languages

Set the `LANGUAGE` variable in your `.env` file:

```env
# For English (default)
LANGUAGE=en

# For Greek
LANGUAGE=el
```

Restart the bot for changes to take effect.

### Available Languages

- **en** - English (default)
- **el** - Greek (Ελληνικά)

### Translating to Greek

1. Open `src/messages/el.js`
2. Replace English text with Greek translations
3. Keep variable placeholders unchanged (e.g., `${title}`, `${count}`, `${username}`)
4. Keep function structures intact: `(param) => \`template string\``
5. Save and set `LANGUAGE=el` in `.env`

Example:

```javascript
// src/messages/en.js
buttonWatched: "Watched",

// src/messages/el.js
buttonWatched: "Έχω δει",
```

### Adding More Languages

To add a new language (e.g., Spanish):

1. Copy `src/messages/en.js` to `src/messages/es.js`
2. Translate all strings in `es.js`
3. Add it to `src/messages/index.js`:
   ```javascript
   const languages = {
     en: require("./en"),
     el: require("./el"),
     ee: require("./ee"), // Add this line
   };
   ```
4. Set `LANGUAGE=ee` in `.env`

## Overseerr Setup (Optional)

If you want to enable Plex movie requests through Overseerr:

### 1. Get Overseerr API Key

1. Log into your Overseerr instance as an admin
2. Go to **Settings** → **General**
3. Scroll to **API Key** section
4. Copy your API key

### 2. Configure Environment Variables

Add to your `.env` file:

```env
OVERSEERR_URL=http://your-overseerr-url:5055
OVERSEERR_API_KEY=your_api_key_here
```

### 3. Link Discord Users to Overseerr

Use admin commands to link Discord users to their Overseerr/Plex accounts:

```
/overseerr link @username their_overseerr_username
```

Or use their Plex email:
```
/overseerr link @username user@example.com
```

The bot will search Overseerr for a matching user and create the link.

### 4. Verify Setup

Test the connection:
```
/overseerr status
```

View all linked accounts:
```
/overseerr list
```

### How It Works

1. **Account Linking**: Admin links Discord users to their Overseerr accounts using usernames or emails
2. **Automatic Status**: Movie posts show availability status (Available/Pending/Request)
3. **Request Methods**:
   - **From Movie Posts**: Click "Request on Plex" button on any movie post
   - **Quick Request**: Use `/request [title]` command for instant requests without creating posts
4. **4K Toggle**: Modal appears allowing users to request in 4K quality
5. **Request Management**: Users view their requests with `/myrequests`

### Linking Options

You have three ways to link users:

**Option 1: By Overseerr Display Name**
```
/overseerr link @discorduser OverseerrUsername
```

**Option 2: By Plex Username**
```
/overseerr link @discorduser PlexUsername
```

**Option 3: By Plex Email**
```
/overseerr link @discorduser user@example.com
```

The bot searches all three fields and creates the link automatically.

### Unlinking

To remove a link:
```
/overseerr unlink @username
```

## Technologies

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [TMDB API](https://www.themoviedb.org/documentation/api) - Movie data
- [Overseerr API](https://docs.overseerr.dev/) - Media request management (optional)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database
- [axios](https://axios-http.com/) - HTTP client
- [Jest](https://jestjs.io/) - Testing framework

## Troubleshooting

### Bot doesn't respond to commands

- Make sure the bot is online (check your terminal for "✅ Bot is online")
- Verify the bot has the correct permissions in your Discord server
- Check that slash commands are registered (look for "✅ Slash commands registered successfully!" in logs)
- Try kicking and re-inviting the bot with the OAuth2 URL

### "Movie forum channel not found" error

- Verify `MOVIE_FORUM_CHANNEL_ID` in `.env` is correct
- Make sure Developer Mode is enabled in Discord to copy channel IDs
- Ensure the channel is a **Forum Channel** (not a text channel)

### Database errors

- Check that you have write permissions in the bot directory
- Verify `NODE_ENV` is set correctly in `.env`
- Delete the database file and restart to recreate (you'll lose data)

### TMDB API errors

- Verify your `TMDB_API_KEY` is correct
- Make sure you're using the API Key (v3 auth), not the API Read Access Token
- Check your TMDB API key hasn't been rate limited

### Buttons not working

- Make sure the bot has "Use Application Commands" permission
- Check bot logs for any errors when clicking buttons
- Verify the bot hasn't been restarted (button interactions from before restart won't work)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

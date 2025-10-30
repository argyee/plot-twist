// Database setup and queries using better-sqlite3
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Determine database path based on NODE_ENV
// Store database files in data/ directory at project root
let dbPath;
if (process.env.NODE_ENV === "production") {
  dbPath = path.join(__dirname, "..", "..", "data", "movies.db");
} else if (process.env.NODE_ENV === "test") {
  dbPath = ":memory:"; // Use in-memory database for tests (faster, no cleanup needed)
} else {
  dbPath = path.join(__dirname, "..", "..", "data", "movies_dev.db");
}

console.log(`📁 Using database: ${dbPath}`);

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  console.log(`📁 Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Create tables
function initDatabase() {
  // User watchlist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      movie_title TEXT NOT NULL,
      movie_year TEXT,
      status TEXT NOT NULL CHECK(status IN ('watched', 'want_to_watch')),
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, movie_id, status)
    )
  `);

  // Watch party table
  db.exec(`
    CREATE TABLE IF NOT EXISTS watch_parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id TEXT NOT NULL UNIQUE,
      message_id TEXT NOT NULL,
      thread_id TEXT,
      event_id TEXT,
      organized_by TEXT NOT NULL,
      organized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      event_date DATETIME,
      completed BOOLEAN DEFAULT 0
    )
  `);

  // Overseerr account linking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS overseerr_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_user_id TEXT UNIQUE NOT NULL,
      overseerr_user_id TEXT NOT NULL,
      overseerr_username TEXT,
      plex_username TEXT,
      linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      linked_by TEXT
    )
  `);

  console.log("✅ Database tables initialized");
}

// Add movie to user's watchlist
function addToWatchlist(userId, movieId, movieTitle, movieYear, status) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO watchlist (user_id, movie_id, movie_title, movie_year, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(userId, movieId, movieTitle, movieYear, status);
  return result.changes > 0; // Returns true if new entry was added
}

// Remove movie from user's watchlist
function removeFromWatchlist(userId, movieId, status) {
  const stmt = db.prepare(`
    DELETE FROM watchlist
    WHERE user_id = ? AND movie_id = ? AND status = ?
  `);

  const result = stmt.run(userId, movieId, status);
  return result.changes > 0;
}

// Check if movie is in user's watchlist
function isInWatchlist(userId, movieId, status) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM watchlist
    WHERE user_id = ? AND movie_id = ? AND status = ?
  `);

  const result = stmt.get(userId, movieId, status);
  return result.count > 0;
}

// Get user's watchlist by status
function getUserWatchlist(userId, status) {
  const stmt = db.prepare(`
    SELECT movie_id, movie_title, movie_year, added_at
    FROM watchlist
    WHERE user_id = ? AND status = ?
    ORDER BY added_at DESC
  `);

  return stmt.all(userId, status);
}

// Get all movies user has interacted with
function getUserMovies(userId) {
  const stmt = db.prepare(`
    SELECT movie_id, movie_title, movie_year, status, added_at
    FROM watchlist
    WHERE user_id = ?
    ORDER BY added_at DESC
  `);

  return stmt.all(userId);
}

// Get count of users who marked a movie with specific status
function getMovieStatusCount(movieId, status) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM watchlist
    WHERE movie_id = ? AND status = ?
  `);

  const result = stmt.get(movieId, status);
  return result.count;
}

// Check if watch party already exists for a movie
function watchPartyExists(movieId) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM watch_parties
    WHERE movie_id = ? AND completed = 0
  `);

  const result = stmt.get(movieId);
  return result.count > 0;
}

// Create a watch party
function createWatchParty(movieId, messageId, organizedBy) {
  const stmt = db.prepare(`
    INSERT INTO watch_parties (movie_id, message_id, organized_by)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(movieId, messageId, organizedBy);
  return result.lastInsertRowid;
}

// Update watch party with thread and event IDs
function updateWatchParty(movieId, threadId, eventId) {
  const stmt = db.prepare(`
    UPDATE watch_parties
    SET thread_id = ?, event_id = ?
    WHERE movie_id = ?
  `);

  return stmt.run(threadId, eventId, movieId);
}

// Get users who want to watch a specific movie
function getUsersWantingToWatch(movieId) {
  const stmt = db.prepare(`
    SELECT user_id, movie_title, movie_year
    FROM watchlist
    WHERE movie_id = ? AND status = 'want_to_watch'
  `);

  return stmt.all(movieId);
}

// Link Discord user to Overseerr account
function linkOverseerAccount(
  discordUserId,
  overseerUserId,
  overseerUsername,
  plexUsername,
  linkedBy
) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO overseerr_links
    (discord_user_id, overseerr_user_id, overseerr_username, plex_username, linked_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    discordUserId,
    overseerUserId,
    overseerUsername,
    plexUsername,
    linkedBy
  );
  return result.changes > 0;
}

// Get Overseerr link for Discord user
function getOverseerLink(discordUserId) {
  const stmt = db.prepare(`
    SELECT * FROM overseerr_links
    WHERE discord_user_id = ?
  `);

  return stmt.get(discordUserId);
}

// Remove Overseerr link
function unlinkOverseerAccount(discordUserId) {
  const stmt = db.prepare(`
    DELETE FROM overseerr_links WHERE discord_user_id = ?
  `);

  const result = stmt.run(discordUserId);
  return result.changes > 0;
}

// Get all Overseerr links
function getAllOverseerLinks() {
  const stmt = db.prepare(`
    SELECT * FROM overseerr_links
    ORDER BY linked_at DESC
  `);

  return stmt.all();
}

// Initialize database on load
initDatabase();

module.exports = {
  db,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getUserWatchlist,
  getUserMovies,
  getMovieStatusCount,
  watchPartyExists,
  createWatchParty,
  updateWatchParty,
  getUsersWantingToWatch,
  linkOverseerAccount,
  getOverseerLink,
  unlinkOverseerAccount,
  getAllOverseerLinks,
};

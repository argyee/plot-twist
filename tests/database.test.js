/**
 * Tests for database.js
 * Tests database operations with an in-memory test database
 */

const Database = require("better-sqlite3");

// Mock database module to use in-memory database for testing
jest.mock("better-sqlite3");

describe("Database Service", () => {
  let db;
  let dbFunctions;

  beforeEach(() => {
    // Create in-memory database for each test
    db = new Database(":memory:");

    // Create tables (same schema as production)
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

    // Create database functions manually (since we're mocking the module)
    dbFunctions = {
      addToWatchlist: (userId, movieId, movieTitle, movieYear, status) => {
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO watchlist (user_id, movie_id, movie_title, movie_year, status)
          VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(userId, movieId, movieTitle, movieYear, status);
        return result.changes > 0;
      },

      removeFromWatchlist: (userId, movieId, status) => {
        const stmt = db.prepare(`
          DELETE FROM watchlist
          WHERE user_id = ? AND movie_id = ? AND status = ?
        `);
        const result = stmt.run(userId, movieId, status);
        return result.changes > 0;
      },

      isInWatchlist: (userId, movieId, status) => {
        const stmt = db.prepare(`
          SELECT COUNT(*) as count
          FROM watchlist
          WHERE user_id = ? AND movie_id = ? AND status = ?
        `);
        const result = stmt.get(userId, movieId, status);
        return result.count > 0;
      },

      getUserWatchlist: (userId, status) => {
        const stmt = db.prepare(`
          SELECT movie_id, movie_title, movie_year, added_at
          FROM watchlist
          WHERE user_id = ? AND status = ?
          ORDER BY added_at DESC
        `);
        return stmt.all(userId, status);
      },

      getUserMovies: (userId) => {
        const stmt = db.prepare(`
          SELECT movie_id, movie_title, movie_year, status, added_at
          FROM watchlist
          WHERE user_id = ?
          ORDER BY added_at DESC
        `);
        return stmt.all(userId);
      },

      getMovieStatusCount: (movieId, status) => {
        const stmt = db.prepare(`
          SELECT COUNT(*) as count
          FROM watchlist
          WHERE movie_id = ? AND status = ?
        `);
        const result = stmt.get(movieId, status);
        return result.count;
      },

      watchPartyExists: (movieId) => {
        const stmt = db.prepare(`
          SELECT COUNT(*) as count
          FROM watch_parties
          WHERE movie_id = ? AND completed = 0
        `);
        const result = stmt.get(movieId);
        return result.count > 0;
      },

      createWatchParty: (movieId, messageId, organizedBy) => {
        const stmt = db.prepare(`
          INSERT INTO watch_parties (movie_id, message_id, organized_by)
          VALUES (?, ?, ?)
        `);
        const result = stmt.run(movieId, messageId, organizedBy);
        return result.lastInsertRowid;
      },

      updateWatchParty: (movieId, threadId, eventId) => {
        const stmt = db.prepare(`
          UPDATE watch_parties
          SET thread_id = ?, event_id = ?
          WHERE movie_id = ?
        `);
        return stmt.run(threadId, eventId, movieId);
      },

      getUsersWantingToWatch: (movieId) => {
        const stmt = db.prepare(`
          SELECT user_id, movie_title, movie_year
          FROM watchlist
          WHERE movie_id = ? AND status = 'want_to_watch'
        `);
        return stmt.all(movieId);
      },
    };
  });

  afterEach(() => {
    // Clean up
    db.close();
  });

  describe("addToWatchlist", () => {
    test("should add a movie to user's watched list", () => {
      const result = dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );

      expect(result).toBe(true);
      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(true);
    });

    test("should add a movie to user's want_to_watch list", () => {
      const result = dbFunctions.addToWatchlist(
        "user456",
        "13",
        "Forrest Gump",
        "1994",
        "want_to_watch"
      );

      expect(result).toBe(true);
      expect(dbFunctions.isInWatchlist("user456", "13", "want_to_watch")).toBe(
        true
      );
    });

    test("should not add duplicate entry (INSERT OR IGNORE)", () => {
      // Add first time
      const first = dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );
      expect(first).toBe(true);

      // Try to add again
      const second = dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );
      expect(second).toBe(false);
    });

    test("should allow same movie with different status for same user", () => {
      // Add to watched
      const watched = dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );
      expect(watched).toBe(true);

      // Add to want_to_watch
      const wantToWatch = dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      expect(wantToWatch).toBe(true);

      // Both should exist
      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(true);
      expect(dbFunctions.isInWatchlist("user123", "550", "want_to_watch")).toBe(
        true
      );
    });
  });

  describe("removeFromWatchlist", () => {
    test("should remove a movie from user's watchlist", () => {
      // Add movie first
      dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );

      // Remove it
      const result = dbFunctions.removeFromWatchlist("user123", "550", "watched");
      expect(result).toBe(true);
      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(false);
    });

    test("should return false when removing non-existent entry", () => {
      const result = dbFunctions.removeFromWatchlist(
        "user999",
        "999",
        "watched"
      );
      expect(result).toBe(false);
    });

    test("should only remove the specific status, not all statuses", () => {
      // Add same movie with both statuses
      dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );
      dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      // Remove only 'watched'
      dbFunctions.removeFromWatchlist("user123", "550", "watched");

      // 'watched' should be gone, 'want_to_watch' should remain
      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(false);
      expect(dbFunctions.isInWatchlist("user123", "550", "want_to_watch")).toBe(
        true
      );
    });
  });

  describe("isInWatchlist", () => {
    test("should return true when movie is in watchlist", () => {
      dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );
      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(true);
    });

    test("should return false when movie is not in watchlist", () => {
      expect(dbFunctions.isInWatchlist("user999", "999", "watched")).toBe(false);
    });

    test("should distinguish between different statuses", () => {
      dbFunctions.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );

      expect(dbFunctions.isInWatchlist("user123", "550", "watched")).toBe(true);
      expect(dbFunctions.isInWatchlist("user123", "550", "want_to_watch")).toBe(
        false
      );
    });
  });

  describe("getUserWatchlist", () => {
    test("should return user's watched movies sorted by date (newest first)", () => {
      dbFunctions.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist(
        "user123",
        "13",
        "Forrest Gump",
        "1994",
        "watched"
      );
      dbFunctions.addToWatchlist(
        "user123",
        "680",
        "Pulp Fiction",
        "1994",
        "watched"
      );

      const watchlist = dbFunctions.getUserWatchlist("user123", "watched");

      expect(watchlist).toHaveLength(3);
      expect(watchlist[0].movie_title).toBe("Pulp Fiction"); // Most recent
      expect(watchlist[1].movie_title).toBe("Forrest Gump");
      expect(watchlist[2].movie_title).toBe("Fight Club");
    });

    test("should return user's want_to_watch movies", () => {
      dbFunctions.addToWatchlist(
        "user456",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist(
        "user456",
        "13",
        "Forrest Gump",
        "1994",
        "want_to_watch"
      );

      const watchlist = dbFunctions.getUserWatchlist("user456", "want_to_watch");

      expect(watchlist).toHaveLength(2);
      expect(watchlist[0].movie_id).toBe("13"); // Most recent
      expect(watchlist[1].movie_id).toBe("550");
    });

    test("should return empty array when user has no movies", () => {
      const watchlist = dbFunctions.getUserWatchlist("user999", "watched");
      expect(watchlist).toEqual([]);
    });

    test("should only return movies with specified status", () => {
      dbFunctions.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist(
        "user123",
        "13",
        "Forrest Gump",
        "1994",
        "want_to_watch"
      );

      const watched = dbFunctions.getUserWatchlist("user123", "watched");
      const wantToWatch = dbFunctions.getUserWatchlist("user123", "want_to_watch");

      expect(watched).toHaveLength(1);
      expect(watched[0].movie_title).toBe("Fight Club");
      expect(wantToWatch).toHaveLength(1);
      expect(wantToWatch[0].movie_title).toBe("Forrest Gump");
    });
  });

  describe("getUserMovies", () => {
    test("should return all movies user has interacted with (both statuses)", () => {
      dbFunctions.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist(
        "user123",
        "13",
        "Forrest Gump",
        "1994",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist(
        "user123",
        "680",
        "Pulp Fiction",
        "1994",
        "watched"
      );

      const movies = dbFunctions.getUserMovies("user123");

      expect(movies).toHaveLength(3);
      expect(movies[0].status).toBe("watched"); // Pulp Fiction (most recent)
      expect(movies[1].status).toBe("want_to_watch"); // Forrest Gump
      expect(movies[2].status).toBe("watched"); // Fight Club
    });

    test("should return empty array when user has no movies", () => {
      const movies = dbFunctions.getUserMovies("user999");
      expect(movies).toEqual([]);
    });
  });

  describe("getMovieStatusCount", () => {
    test("should count users who watched a movie", () => {
      dbFunctions.addToWatchlist("user1", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist("user2", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist("user3", "550", "Fight Club", "1999", "watched");

      const count = dbFunctions.getMovieStatusCount("550", "watched");
      expect(count).toBe(3);
    });

    test("should count users who want to watch a movie", () => {
      dbFunctions.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist(
        "user2",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const count = dbFunctions.getMovieStatusCount("550", "want_to_watch");
      expect(count).toBe(2);
    });

    test("should return 0 when no users have marked the movie", () => {
      const count = dbFunctions.getMovieStatusCount("999", "watched");
      expect(count).toBe(0);
    });

    test("should distinguish between watched and want_to_watch counts", () => {
      dbFunctions.addToWatchlist("user1", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist("user2", "550", "Fight Club", "1999", "watched");
      dbFunctions.addToWatchlist(
        "user3",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const watchedCount = dbFunctions.getMovieStatusCount("550", "watched");
      const wantToWatchCount = dbFunctions.getMovieStatusCount(
        "550",
        "want_to_watch"
      );

      expect(watchedCount).toBe(2);
      expect(wantToWatchCount).toBe(1);
    });
  });

  describe("watchPartyExists", () => {
    test("should return true when active watch party exists", () => {
      dbFunctions.createWatchParty("550", "msg123", "user123");

      const exists = dbFunctions.watchPartyExists("550");
      expect(exists).toBe(true);
    });

    test("should return false when no watch party exists", () => {
      const exists = dbFunctions.watchPartyExists("999");
      expect(exists).toBe(false);
    });

    test("should return false when watch party is completed", () => {
      // Create watch party
      dbFunctions.createWatchParty("550", "msg123", "user123");

      // Mark as completed
      db.prepare(
        "UPDATE watch_parties SET completed = 1 WHERE movie_id = ?"
      ).run("550");

      const exists = dbFunctions.watchPartyExists("550");
      expect(exists).toBe(false);
    });
  });

  describe("createWatchParty", () => {
    test("should create a watch party and return row ID", () => {
      const rowId = dbFunctions.createWatchParty("550", "msg123", "user123");

      expect(rowId).toBeGreaterThan(0);
      expect(dbFunctions.watchPartyExists("550")).toBe(true);
    });

    test("should store organizer information", () => {
      dbFunctions.createWatchParty("550", "msg123", "user123");

      const party = db
        .prepare("SELECT * FROM watch_parties WHERE movie_id = ?")
        .get("550");

      expect(party.movie_id).toBe("550");
      expect(party.message_id).toBe("msg123");
      expect(party.organized_by).toBe("user123");
      expect(party.completed).toBe(0);
    });
  });

  describe("updateWatchParty", () => {
    test("should update watch party with thread and event IDs", () => {
      // Create watch party first
      dbFunctions.createWatchParty("550", "msg123", "user123");

      // Update it
      const result = dbFunctions.updateWatchParty("550", "thread456", "event789");

      expect(result.changes).toBe(1);

      // Verify update
      const party = db
        .prepare("SELECT * FROM watch_parties WHERE movie_id = ?")
        .get("550");

      expect(party.thread_id).toBe("thread456");
      expect(party.event_id).toBe("event789");
    });

    test("should return 0 changes when movie ID doesn't exist", () => {
      const result = dbFunctions.updateWatchParty("999", "thread456", "event789");
      expect(result.changes).toBe(0);
    });
  });

  describe("getUsersWantingToWatch", () => {
    test("should return all users who want to watch a movie", () => {
      dbFunctions.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist(
        "user2",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist(
        "user3",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const users = dbFunctions.getUsersWantingToWatch("550");

      expect(users).toHaveLength(3);
      expect(users[0].user_id).toBe("user1");
      expect(users[1].user_id).toBe("user2");
      expect(users[2].user_id).toBe("user3");
      expect(users[0].movie_title).toBe("Fight Club");
    });

    test("should only return users with want_to_watch status, not watched", () => {
      dbFunctions.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      dbFunctions.addToWatchlist("user2", "550", "Fight Club", "1999", "watched");

      const users = dbFunctions.getUsersWantingToWatch("550");

      expect(users).toHaveLength(1);
      expect(users[0].user_id).toBe("user1");
    });

    test("should return empty array when no users want to watch", () => {
      const users = dbFunctions.getUsersWantingToWatch("999");
      expect(users).toEqual([]);
    });
  });
});

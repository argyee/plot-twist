/**
 * Tests for database.js
 * Tests all database operations using an in-memory database
 */

// Set test environment BEFORE requiring the database module
// This makes database.js use :memory: instead of a file
process.env.NODE_ENV = "test";

// Now require the database module (it will use in-memory database)
const database = require("../src/services/database");

describe("Database Service", () => {
  beforeEach(() => {
    // Clear all tables before each test
    database.db.exec("DELETE FROM watchlist");
    database.db.exec("DELETE FROM watch_parties");
  });

  afterAll(() => {
    // Close database connection
    database.db.close();
  });

  describe("addToWatchlist", () => {
    test("should add a movie to user's watched list", () => {
      const result = database.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );

      expect(result).toBe(true);

      // Verify it was added
      const row = database.db
        .prepare("SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?")
        .get("user123", "550");

      expect(row).toBeDefined();
      expect(row.movie_title).toBe("Fight Club");
      expect(row.status).toBe("watched");
    });

    test("should add a movie to user's want_to_watch list", () => {
      const result = database.addToWatchlist(
        "user456",
        "551",
        "The Matrix",
        "1999",
        "want_to_watch"
      );

      expect(result).toBe(true);

      const row = database.db
        .prepare(
          "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ? AND status = ?"
        )
        .get("user456", "551", "want_to_watch");

      expect(row).toBeDefined();
      expect(row.movie_title).toBe("The Matrix");
    });

    test("should return false when trying to add duplicate entry", () => {
      // Add first time
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      // Try to add again
      const result = database.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "watched"
      );

      expect(result).toBe(false);
    });

    test("should allow same movie with different status", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      const result = database.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      expect(result).toBe(true);

      // Verify both entries exist
      const row = database.db
        .prepare(
          "SELECT COUNT(*) as count FROM watchlist WHERE user_id = ? AND movie_id = ?"
        )
        .get("user123", "550");

      expect(row.count).toBe(2);
    });
  });

  describe("removeFromWatchlist", () => {
    test("should remove a movie from user's watchlist", () => {
      // Add first
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      // Remove
      const result = database.removeFromWatchlist("user123", "550", "watched");

      expect(result).toBe(true);

      // Verify it was removed
      const row = database.db
        .prepare(
          "SELECT COUNT(*) as count FROM watchlist WHERE user_id = ? AND movie_id = ?"
        )
        .get("user123", "550");

      expect(row.count).toBe(0);
    });

    test("should return false when removing non-existent entry", () => {
      const result = database.removeFromWatchlist("user999", "999", "watched");

      expect(result).toBe(false);
    });

    test("should only remove the specific status entry", () => {
      // Add same movie with two statuses
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist(
        "user123",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      // Remove only 'watched'
      database.removeFromWatchlist("user123", "550", "watched");

      // Verify 'want_to_watch' still exists
      const row = database.db
        .prepare(
          "SELECT COUNT(*) as count FROM watchlist WHERE user_id = ? AND movie_id = ? AND status = ?"
        )
        .get("user123", "550", "want_to_watch");

      expect(row.count).toBe(1);
    });
  });

  describe("isInWatchlist", () => {
    test("should return true when movie is in watchlist", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      const result = database.isInWatchlist("user123", "550", "watched");

      expect(result).toBe(true);
    });

    test("should return false when movie is not in watchlist", () => {
      const result = database.isInWatchlist("user999", "999", "watched");

      expect(result).toBe(false);
    });

    test("should check status correctly", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      // Check for wrong status
      const result = database.isInWatchlist("user123", "550", "want_to_watch");

      expect(result).toBe(false);
    });
  });

  describe("getUserWatchlist", () => {
    test("should return all movies with specific status for user", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist("user123", "551", "The Matrix", "1999", "watched");
      database.addToWatchlist(
        "user123",
        "552",
        "Inception",
        "2010",
        "want_to_watch"
      );

      const watchedList = database.getUserWatchlist("user123", "watched");

      expect(watchedList).toHaveLength(2);
      // Both movies should be in the list
      expect(watchedList.some((m) => m.movie_title === "The Matrix")).toBe(true);
      expect(watchedList.some((m) => m.movie_title === "Fight Club")).toBe(true);
    });

    test("should return empty array when user has no movies with that status", () => {
      const result = database.getUserWatchlist("user999", "watched");

      expect(result).toEqual([]);
    });

    test("should order by added_at DESC (most recent first)", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist("user123", "551", "The Matrix", "1999", "watched");

      const watchedList = database.getUserWatchlist("user123", "watched");

      // Verify both movies are in the list
      expect(watchedList).toHaveLength(2);
      expect(watchedList.some((m) => m.movie_title === "The Matrix")).toBe(true);
      expect(watchedList.some((m) => m.movie_title === "Fight Club")).toBe(true);
      // Verify they have added_at timestamps
      expect(watchedList[0].added_at).toBeDefined();
      expect(watchedList[1].added_at).toBeDefined();
    });

    test("should include movie_year and added_at fields", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");

      const watchedList = database.getUserWatchlist("user123", "watched");

      expect(watchedList[0].movie_year).toBe("1999");
      expect(watchedList[0].added_at).toBeDefined();
    });
  });

  describe("getUserMovies", () => {
    test("should return all movies for user regardless of status", () => {
      database.addToWatchlist("user123", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist(
        "user123",
        "551",
        "The Matrix",
        "1999",
        "want_to_watch"
      );

      const movies = database.getUserMovies("user123");

      expect(movies).toHaveLength(2);
      expect(movies.find((m) => m.status === "watched")).toBeDefined();
      expect(movies.find((m) => m.status === "want_to_watch")).toBeDefined();
    });

    test("should return empty array when user has no movies", () => {
      const movies = database.getUserMovies("user999");

      expect(movies).toEqual([]);
    });
  });

  describe("getMovieStatusCount", () => {
    test("should return count of users who marked movie with specific status", () => {
      database.addToWatchlist("user1", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist("user2", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist("user3", "550", "Fight Club", "1999", "watched");

      const count = database.getMovieStatusCount("550", "watched");

      expect(count).toBe(3);
    });

    test("should return 0 when no users marked movie with that status", () => {
      const count = database.getMovieStatusCount("999", "watched");

      expect(count).toBe(0);
    });

    test("should count only specific status", () => {
      database.addToWatchlist("user1", "550", "Fight Club", "1999", "watched");
      database.addToWatchlist(
        "user2",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const watchedCount = database.getMovieStatusCount("550", "watched");
      const wantToWatchCount = database.getMovieStatusCount("550", "want_to_watch");

      expect(watchedCount).toBe(1);
      expect(wantToWatchCount).toBe(1);
    });

    test("should handle multiple users wanting to watch", () => {
      database.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      database.addToWatchlist(
        "user2",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      database.addToWatchlist(
        "user3",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const count = database.getMovieStatusCount("550", "want_to_watch");

      expect(count).toBe(3);
    });
  });

  describe("watchPartyExists", () => {
    test("should return true when active watch party exists", () => {
      database.createWatchParty("550", "msg123", "user123");

      const exists = database.watchPartyExists("550");

      expect(exists).toBe(true);
    });

    test("should return false when no watch party exists", () => {
      const exists = database.watchPartyExists("999");

      expect(exists).toBe(false);
    });

    test("should only check for non-completed parties", () => {
      // Create party
      database.createWatchParty("550", "msg123", "user123");

      // Mark as completed
      database.db
        .prepare("UPDATE watch_parties SET completed = 1 WHERE movie_id = ?")
        .run("550");

      const exists = database.watchPartyExists("550");

      expect(exists).toBe(false);
    });
  });

  describe("createWatchParty", () => {
    test("should create a watch party and return the ID", () => {
      const partyId = database.createWatchParty("550", "msg123", "user123");

      expect(partyId).toBeGreaterThan(0);

      // Verify it was created
      const party = database.db
        .prepare("SELECT * FROM watch_parties WHERE id = ?")
        .get(partyId);

      expect(party.movie_id).toBe("550");
      expect(party.message_id).toBe("msg123");
      expect(party.organized_by).toBe("user123");
    });

    test("should set default values for optional fields", () => {
      const partyId = database.createWatchParty("550", "msg123", "user123");

      const party = database.db
        .prepare("SELECT * FROM watch_parties WHERE id = ?")
        .get(partyId);

      expect(party.thread_id).toBeNull();
      expect(party.event_id).toBeNull();
      expect(party.completed).toBe(0);
    });
  });

  describe("updateWatchParty", () => {
    test("should update watch party with thread and event IDs", () => {
      const partyId = database.createWatchParty("550", "msg123", "user123");

      database.updateWatchParty("550", "thread456", "event789");

      const party = database.db
        .prepare("SELECT * FROM watch_parties WHERE id = ?")
        .get(partyId);

      expect(party.thread_id).toBe("thread456");
      expect(party.event_id).toBe("event789");
    });

    test("should allow null values for thread and event IDs", () => {
      const partyId = database.createWatchParty("550", "msg123", "user123");

      database.updateWatchParty("550", null, null);

      const party = database.db
        .prepare("SELECT * FROM watch_parties WHERE id = ?")
        .get(partyId);

      expect(party.thread_id).toBeNull();
      expect(party.event_id).toBeNull();
    });
  });

  describe("getUsersWantingToWatch", () => {
    test("should return all users who want to watch a movie", () => {
      database.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      database.addToWatchlist(
        "user2",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );
      database.addToWatchlist("user3", "550", "Fight Club", "1999", "watched");

      const users = database.getUsersWantingToWatch("550");

      expect(users).toHaveLength(2);
      expect(users.find((u) => u.user_id === "user1")).toBeDefined();
      expect(users.find((u) => u.user_id === "user2")).toBeDefined();
      expect(users.find((u) => u.user_id === "user3")).toBeUndefined();
    });

    test("should return empty array when no users want to watch", () => {
      const users = database.getUsersWantingToWatch("999");

      expect(users).toEqual([]);
    });

    test("should include movie_title and movie_year", () => {
      database.addToWatchlist(
        "user1",
        "550",
        "Fight Club",
        "1999",
        "want_to_watch"
      );

      const users = database.getUsersWantingToWatch("550");

      expect(users[0].movie_title).toBe("Fight Club");
      expect(users[0].movie_year).toBe("1999");
    });
  });

  describe("Database Initialization", () => {
    test("should create watchlist table on init", () => {
      const table = database.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='watchlist'"
        )
        .get();

      expect(table).toBeDefined();
      expect(table.name).toBe("watchlist");
    });

    test("should create watch_parties table on init", () => {
      const table = database.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='watch_parties'"
        )
        .get();

      expect(table).toBeDefined();
      expect(table.name).toBe("watch_parties");
    });
  });
});

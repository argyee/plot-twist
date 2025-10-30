/**
 * Tests for buttonBuilder.js
 * Tests dynamic button creation logic with mocked database calls
 */

// Mock messages module
jest.mock("../src/messages", () => ({
  buttonWatched: "Watched",
  buttonWantToWatch: "Want to Watch",
  buttonDelete: "Delete Post",
  buttonIMDB: "IMDB",
  buttonWatchParty: (count) => `Organize Watch Party (${count} interested)`,
  buttonRequestOnPlex: "Request on Plex",
  buttonRequestPending: "Request Pending",
  buttonAvailableOnPlex: "Available on Plex",
}));

// Mock config module
jest.mock("../src/services/config", () => ({
  watchParty: {
    dynamicCount: true,
    threshold: 3,
  },
}));

// Mock database module
jest.mock("../src/services/database", () => ({
  getMovieStatusCount: jest.fn(),
  watchPartyExists: jest.fn(),
}));

// Mock overseerr module
jest.mock("../src/services/overseerr", () => ({
  isConfigured: jest.fn(() => false), // Default to not configured
}));

const { buildMovieButtons } = require("../src/utils/buttonBuilder");
const database = require("../src/services/database");

describe("Button Builder", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Set default mock implementations
    database.getMovieStatusCount.mockReturnValue(0);
    database.watchPartyExists.mockReturnValue(false);
  });

  describe("buildMovieButtons - Basic Buttons", () => {
    test("should always include Watched, Want to Watch, and Delete buttons", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(3);
      expect(row.components[0].data.label).toBe("Watched");
      expect(row.components[0].data.custom_id).toBe("watched_user123_550");
      expect(row.components[1].data.label).toBe("Want to Watch");
      expect(row.components[1].data.custom_id).toBe("watchlist_user123_550");
      expect(row.components[2].data.label).toBe("Delete Post");
      expect(row.components[2].data.custom_id).toBe("delete_user123");
    });

    test("should use correct author ID in button custom IDs", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("999", "author456", movie);

      expect(row.components[0].data.custom_id).toBe("watched_author456_999");
      expect(row.components[1].data.custom_id).toBe("watchlist_author456_999");
      expect(row.components[2].data.custom_id).toBe("delete_author456");
    });

    test("should set correct button styles", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      // ButtonStyle enum: Success=3, Primary=1, Danger=4
      expect(row.components[0].data.style).toBe(3); // Success (green)
      expect(row.components[1].data.style).toBe(1); // Primary (blue)
      expect(row.components[2].data.style).toBe(4); // Danger (red)
    });

    test("should set correct button emojis", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components[0].data.emoji.name).toBe("✅");
      expect(row.components[1].data.emoji.name).toBe("📌");
      expect(row.components[2].data.emoji.name).toBe("🗑️");
    });
  });

  describe("buildMovieButtons - Optional Buttons", () => {
    test("should add IMDB button when imdbUrl is provided", () => {
      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(4);
      const imdbButton = row.components[3];
      expect(imdbButton.data.label).toBe("IMDB");
      expect(imdbButton.data.url).toBe("https://www.imdb.com/title/tt0137523/");
      expect(imdbButton.data.style).toBe(5); // Link style
      expect(imdbButton.data.emoji.name).toBe("⭐");
    });

    test("should not add extra buttons when Overseerr is not configured", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Only basic buttons (Watched, Want to Watch, Delete)
      expect(row.components).toHaveLength(3);
    });

    test("should add IMDB button when provided without Overseerr", () => {
      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Basic + IMDB
      expect(row.components).toHaveLength(4);
      expect(row.components[3].data.label).toBe("IMDB");
    });

    test("should not add IMDB button when imdbUrl is null", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(3); // Only basic buttons
      expect(row.components.every((btn) => btn.data.label !== "IMDB")).toBe(true);
    });
  });

  describe("buildMovieButtons - Watch Party Logic", () => {
    test("should add watch party button when threshold reached", () => {
      database.getMovieStatusCount.mockReturnValue(3); // At threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(4);
      const watchPartyButton = row.components[3];
      expect(watchPartyButton.data.label).toBe("Organize Watch Party (3 interested)");
      expect(watchPartyButton.data.custom_id).toBe("watch_party_550");
      expect(watchPartyButton.data.style).toBe(3); // Success (green)
      expect(watchPartyButton.data.emoji.name).toBe("🎉");
    });

    test("should update watch party button label with interest count", () => {
      database.getMovieStatusCount.mockReturnValue(5); // 5 interested
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      const watchPartyButton = row.components[3];
      expect(watchPartyButton.data.label).toBe("Organize Watch Party (5 interested)");
    });

    test("should not add watch party button when below threshold", () => {
      database.getMovieStatusCount.mockReturnValue(2); // Below threshold of 3
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(3);
      expect(
        row.components.every((btn) => !btn.data.label?.includes("Watch Party"))
      ).toBe(true);
    });

    test("should not add watch party button when party already exists", () => {
      database.getMovieStatusCount.mockReturnValue(5);
      database.watchPartyExists.mockReturnValue(true); // Party exists

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(3);
      expect(
        row.components.every((btn) => !btn.data.label?.includes("Watch Party"))
      ).toBe(true);
    });
  });

  describe("buildMovieButtons - 5 Button Limit", () => {
    test("should include watch party button when threshold reached", () => {
      database.getMovieStatusCount.mockReturnValue(3); // At threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Should have: Watched, Want to Watch, Delete, IMDB, Watch Party
      expect(row.components).toHaveLength(5);
      expect(row.components[3].data.label).toBe("IMDB");
      expect(row.components[4].data.label).toBe("Organize Watch Party (3 interested)");
    });

    test("should show only basic + IMDB when below watch party threshold", () => {
      database.getMovieStatusCount.mockReturnValue(2); // Below threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Should have: Watched, Want to Watch, Delete, IMDB
      expect(row.components).toHaveLength(4);
      expect(row.components[3].data.label).toBe("IMDB");
    });

    test("should respect 5 button maximum", () => {
      database.getMovieStatusCount.mockReturnValue(10);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Should never exceed 5 buttons (Discord limit)
      expect(row.components.length).toBeLessThanOrEqual(5);
    });
  });

  describe("buildMovieButtons - Database Queries", () => {
    test("should query database for want_to_watch count", () => {
      database.getMovieStatusCount.mockReturnValue(2);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      buildMovieButtons("550", "user123", movie);

      expect(database.getMovieStatusCount).toHaveBeenCalledWith("550", "want_to_watch");
    });

    test("should query database to check if watch party exists", () => {
      database.getMovieStatusCount.mockReturnValue(3);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      buildMovieButtons("550", "user123", movie);

      expect(database.watchPartyExists).toHaveBeenCalledWith("550");
    });
  });

  describe("buildMovieButtons - Integration Scenarios", () => {
    test("should show correct buttons for new movie with no interest", () => {
      database.getMovieStatusCount.mockReturnValue(0);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB (no trailer button anymore)
      expect(row.components).toHaveLength(4);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
      ]);
    });

    test("should show correct buttons for popular movie at threshold", () => {
      database.getMovieStatusCount.mockReturnValue(3);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB, Watch Party
      expect(row.components).toHaveLength(5);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
        "Organize Watch Party (3 interested)",
      ]);
    });

    test("should show correct buttons for movie with organized party", () => {
      database.getMovieStatusCount.mockReturnValue(5);
      database.watchPartyExists.mockReturnValue(true); // Party already exists

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB (Watch Party hidden as party exists)
      expect(row.components).toHaveLength(4);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
      ]);
    });

    test("should show correct buttons for movie with no external links", () => {
      database.getMovieStatusCount.mockReturnValue(10);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, Watch Party (only 4 buttons)
      expect(row.components).toHaveLength(4);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "Organize Watch Party (10 interested)",
      ]);
    });
  });

  describe("buildMovieButtons - Overseerr Integration", () => {
    const overseerr = require("../src/services/overseerr");

    beforeEach(() => {
      jest.clearAllMocks();
      database.getMovieStatusCount.mockReturnValue(0);
      database.watchPartyExists.mockReturnValue(false);
    });

    test("should show 'Available on Plex' button when movie is available", () => {
      overseerr.isConfigured.mockReturnValue(true);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: true,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      // Watched, Want to Watch, Delete, IMDB, Available on Plex
      expect(row.components).toHaveLength(5);
      const availableButton = row.components[4];
      expect(availableButton.data.label).toBe("Available on Plex");
      expect(availableButton.data.disabled).toBe(true);
      expect(availableButton.data.style).toBe(3); // Success (green)
      expect(availableButton.data.emoji.name).toBe("🟢");
    });

    test("should show 'Request Pending' button when movie is requested", () => {
      overseerr.isConfigured.mockReturnValue(true);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: false,
        requested: true,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      const pendingButton = row.components[4];
      expect(pendingButton.data.label).toBe("Request Pending");
      expect(pendingButton.data.disabled).toBe(true);
      expect(pendingButton.data.style).toBe(2); // Secondary (gray)
      expect(pendingButton.data.emoji.name).toBe("🟡");
    });

    test("should show 'Request Pending' button when movie is processing", () => {
      overseerr.isConfigured.mockReturnValue(true);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: false,
        requested: false,
        processing: true,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      const pendingButton = row.components[4];
      expect(pendingButton.data.label).toBe("Request Pending");
      expect(pendingButton.data.disabled).toBe(true);
    });

    test("should show clickable 'Request on Plex' button when not available/requested", () => {
      overseerr.isConfigured.mockReturnValue(true);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: false,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      const requestButton = row.components[4];
      expect(requestButton.data.label).toBe("Request on Plex");
      expect(requestButton.data.disabled).toBeUndefined(); // Not disabled
      expect(requestButton.data.style).toBe(1); // Primary (blue)
      expect(requestButton.data.emoji.name).toBe("📥");
      expect(requestButton.data.custom_id).toBe("request_550");
    });

    test("should not add Overseerr button when not configured", () => {
      overseerr.isConfigured.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: true,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      // Should only have: Watched, Want to Watch, Delete, IMDB (no Overseerr button)
      expect(row.components).toHaveLength(4);
      expect(row.components.every((btn) => !btn.data.label?.includes("Plex"))).toBe(true);
    });

    test("should not add Overseerr button when overseerStatus is null", () => {
      overseerr.isConfigured.mockReturnValue(true);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const row = buildMovieButtons("550", "user123", movie, null);

      // Should only have: Watched, Want to Watch, Delete, IMDB
      expect(row.components).toHaveLength(4);
      expect(row.components.every((btn) => !btn.data.label?.includes("Plex"))).toBe(true);
    });

    test("should respect 5 button limit with Overseerr + Watch Party + IMDB", () => {
      overseerr.isConfigured.mockReturnValue(true);
      database.getMovieStatusCount.mockReturnValue(5); // Watch party threshold reached
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: false,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      // Should have exactly 5 buttons (Discord limit)
      expect(row.components).toHaveLength(5);
      // Watched, Want to Watch, Delete, IMDB, Request on Plex
      // (Watch Party button is hidden because we're at the 5-button limit)
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
        "Request on Plex",
      ]);
    });

    test("should prioritize Overseerr button over Watch Party when both conditions met", () => {
      overseerr.isConfigured.mockReturnValue(true);
      database.getMovieStatusCount.mockReturnValue(5); // Watch party threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
      };

      const overseerStatus = {
        available: true,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      // When at 5-button limit, Overseerr takes priority over Watch Party
      expect(row.components).toHaveLength(5);
      expect(row.components[4].data.label).toBe("Available on Plex");
    });

    test("should show both Overseerr and Watch Party buttons when IMDB is missing", () => {
      overseerr.isConfigured.mockReturnValue(true);
      database.getMovieStatusCount.mockReturnValue(5);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: null, // No IMDB link
      };

      const overseerStatus = {
        available: false,
        requested: false,
        processing: false,
      };

      const row = buildMovieButtons("550", "user123", movie, overseerStatus);

      // Watched, Want to Watch, Delete, Request on Plex, Watch Party
      // (With only 4 buttons before, both Overseerr and Watch Party fit within the 5-button limit)
      expect(row.components).toHaveLength(5);
      expect(row.components[3].data.label).toBe("Request on Plex");
      expect(row.components[4].data.label).toBe("Organize Watch Party (5 interested)");
    });
  });
});

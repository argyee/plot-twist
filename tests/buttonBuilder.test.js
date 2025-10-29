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
  buttonTrailer: "Trailer",
  buttonWatchParty: (count) => `Organize Watch Party (${count} interested)`,
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

    test("should add Trailer button when trailerUrl is provided", () => {
      const movie = {
        imdbUrl: null,
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(4);
      const trailerButton = row.components[3];
      expect(trailerButton.data.label).toBe("Trailer");
      expect(trailerButton.data.url).toBe(
        "https://www.youtube.com/watch?v=SUXWAEX2jlg"
      );
      expect(trailerButton.data.style).toBe(5); // Link style
      expect(trailerButton.data.emoji.name).toBe("🎥");
    });

    test("should add both IMDB and Trailer buttons when both URLs provided", () => {
      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      expect(row.components).toHaveLength(5); // All 5 slots filled
      expect(row.components[3].data.label).toBe("IMDB");
      expect(row.components[4].data.label).toBe("Trailer");
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
    test("should hide trailer button when watch party button shows (5 button limit)", () => {
      database.getMovieStatusCount.mockReturnValue(3); // At threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Should have: Watched, Want to Watch, Delete, IMDB, Watch Party
      // Trailer should be hidden
      expect(row.components).toHaveLength(5);
      expect(row.components[3].data.label).toBe("IMDB");
      expect(row.components[4].data.label).toBe("Organize Watch Party (3 interested)");
      expect(row.components.every((btn) => btn.data.label !== "Trailer")).toBe(true);
    });

    test("should show trailer button when watch party button does not show", () => {
      database.getMovieStatusCount.mockReturnValue(2); // Below threshold
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Should have: Watched, Want to Watch, Delete, IMDB, Trailer
      expect(row.components).toHaveLength(5);
      expect(row.components[3].data.label).toBe("IMDB");
      expect(row.components[4].data.label).toBe("Trailer");
    });

    test("should respect 5 button maximum", () => {
      database.getMovieStatusCount.mockReturnValue(10);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
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
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB, Trailer
      expect(row.components).toHaveLength(5);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
        "Trailer",
      ]);
    });

    test("should show correct buttons for popular movie at threshold", () => {
      database.getMovieStatusCount.mockReturnValue(3);
      database.watchPartyExists.mockReturnValue(false);

      const movie = {
        imdbUrl: "https://www.imdb.com/title/tt0137523/",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB, Watch Party (Trailer hidden)
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
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
      };

      const row = buildMovieButtons("550", "user123", movie);

      // Watched, Want to Watch, Delete, IMDB, Trailer (Watch Party hidden)
      expect(row.components).toHaveLength(5);
      expect(row.components.map((b) => b.data.label)).toEqual([
        "Watched",
        "Want to Watch",
        "Delete Post",
        "IMDB",
        "Trailer",
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
});

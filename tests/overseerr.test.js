/**
 * Tests for overseerr.js service
 * Tests core Overseerr API integration functions
 */

// Mock dotenv to prevent loading real .env file
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Set mock environment variables BEFORE requiring overseerr
process.env.OVERSEERR_URL = "http://localhost:5055";
process.env.OVERSEERR_API_KEY = "test-api-key";

// Mock axios before requiring overseerr
jest.mock("axios");
const axios = require("axios");

// Create a mock axios instance that will be used for all tests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};

// Mock axios.create to return our mock instance
axios.create.mockReturnValue(mockAxiosInstance);

// Now require overseerr AFTER setting up mocks
const overseerr = require("../src/services/overseerr");

describe("Overseerr Service", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("isConfigured", () => {
    test("should return true when Overseerr is configured", () => {
      expect(overseerr.isConfigured()).toBe(true);
    });

    test("should return false when URL is missing", () => {
      const originalUrl = process.env.OVERSEERR_URL;
      delete process.env.OVERSEERR_URL;

      // Need to re-require to pick up environment change
      jest.resetModules();
      const overseerrUnconfigured = require("../src/services/overseerr");

      expect(overseerrUnconfigured.isConfigured()).toBe(false);

      // Restore
      process.env.OVERSEERR_URL = originalUrl;
    });
  });

  describe("getMovieStatus", () => {
    test("should return available=true for status 4 (AVAILABLE)", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: {
            status: 4,
            status4k: 0,
          },
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/v1/movie/550");
      expect(result.available).toBe(true);
      expect(result.requested).toBe(false);
      expect(result.processing).toBe(false);
    });

    test("should return available=true for status 5 (PARTIALLY_AVAILABLE)", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: {
            status: 5,
            status4k: 0,
          },
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(result.available).toBe(true);
      expect(result.requested).toBe(false);
      expect(result.processing).toBe(false);
    });

    test("should return requested=true for status 2 (PENDING)", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: {
            status: 2,
            status4k: 0,
          },
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(result.available).toBe(false);
      expect(result.requested).toBe(true);
      expect(result.processing).toBe(false);
    });

    test("should return processing=true for status 3 (PROCESSING)", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: {
            status: 3,
            status4k: 0,
          },
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(result.available).toBe(false);
      // Status 3 is both requested and processing (status >= 2 && status < 4)
      expect(result.requested).toBe(true);
      expect(result.processing).toBe(true);
    });

    test("should handle 4K status separately", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: {
            status: 4,
            status4k: 5,
          },
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(result.available).toBe(true);
      expect(result.available4k).toBe(true);
    });

    test("should return false for all statuses on 404 error", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { status: 404 },
      });

      const result = await overseerr.getMovieStatus("999");

      expect(result.available).toBe(false);
      expect(result.requested).toBe(false);
      expect(result.processing).toBe(false);
    });

    test("should return false for all statuses on API error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

      const result = await overseerr.getMovieStatus("550");

      expect(result.available).toBe(false);
      expect(result.requested).toBe(false);
      expect(result.processing).toBe(false);
    });

    test("should include mediaInfo in response", async () => {
      const mockMediaInfo = {
        status: 4,
        status4k: 0,
        downloadStatus: [],
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          mediaInfo: mockMediaInfo,
        },
      });

      const result = await overseerr.getMovieStatus("550");

      expect(result.mediaInfo).toEqual(mockMediaInfo);
    });
  });

  describe("createMovieRequest", () => {
    test("should create a movie request successfully", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          id: 123,
          mediaId: 550,
          is4k: false,
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/v1/request", {
        mediaType: "movie",
        mediaId: 550,
        is4k: false,
        userId: 10,
      });
      expect(result.success).toBe(true);
      expect(result.requestId).toBe(123);
    });

    test("should create a 4K movie request", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          id: 124,
          mediaId: 550,
          is4k: true,
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", true);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/api/v1/request", {
        mediaType: "movie",
        mediaId: 550,
        is4k: true,
        userId: 10,
      });
      expect(result.success).toBe(true);
    });

    test("should handle duplicate request error (409)", async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 409,
          data: {},
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(result.success).toBe(false);
      expect(result.error).toBe("This movie has already been requested");
    });

    test("should handle permission error (403)", async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 403,
          data: {},
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't have permission to request movies");
    });

    test("should handle quota exceeded error (429)", async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 429,
          data: {},
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You've reached your request quota");
    });

    test("should handle API error message", async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 500,
          data: {
            message: "Custom error from Overseerr",
          },
        },
      });

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Custom error from Overseerr");
    });

    test("should handle generic error", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Network timeout"));

      const result = await overseerr.createMovieRequest("550", "10", false);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create request");
    });
  });

  describe("getUserRequests", () => {
    test("should fetch user requests successfully", async () => {
      const mockRequests = [
        { id: 1, mediaId: 550, type: "movie" },
        { id: 2, mediaId: 680, type: "movie" },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: mockRequests,
        },
      });

      const result = await overseerr.getUserRequests("10");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/v1/request", {
        params: {
          take: 50,
          skip: 0,
          filter: "all",
          sort: "added",
          requestedBy: 10,
        },
      });
      expect(result).toEqual(mockRequests);
    });

    test("should return empty array on error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("API error"));

      const result = await overseerr.getUserRequests("10");

      expect(result).toEqual([]);
    });

    test("should return empty array if results is undefined", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {},
      });

      const result = await overseerr.getUserRequests("10");

      expect(result).toEqual([]);
    });
  });

  describe("deleteRequest", () => {
    test("should delete a request successfully", async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      const result = await overseerr.deleteRequest("123");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/api/v1/request/123");
      expect(result.success).toBe(true);
    });

    test("should handle deletion error", async () => {
      mockAxiosInstance.delete.mockRejectedValue({
        response: {
          data: {
            message: "Request not found",
          },
        },
      });

      const result = await overseerr.deleteRequest("999");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Request not found");
    });

    test("should handle generic deletion error", async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error("Network error"));

      const result = await overseerr.deleteRequest("123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete request");
    });
  });

  describe("getAllUsers", () => {
    test("should fetch all users successfully", async () => {
      const mockUsers = [
        { id: 1, displayName: "User 1", email: "user1@example.com" },
        { id: 2, displayName: "User 2", email: "user2@example.com" },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: mockUsers,
        },
      });

      const result = await overseerr.getAllUsers();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/v1/user");
      expect(result).toEqual(mockUsers);
    });

    test("should return empty array on error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("API error"));

      const result = await overseerr.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserByIdentifier", () => {
    test("should find user by display name (case-insensitive)", async () => {
      const mockUsers = [
        { id: 1, displayName: "JohnDoe", email: "john@example.com", plexUsername: "john_plex" },
        { id: 2, displayName: "JaneSmith", email: "jane@example.com", plexUsername: null },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: mockUsers,
        },
      });

      const result = await overseerr.getUserByIdentifier("johndoe");

      expect(result).toEqual(mockUsers[0]);
    });

    test("should find user by email (case-insensitive)", async () => {
      const mockUsers = [
        { id: 1, displayName: "JohnDoe", email: "john@example.com", plexUsername: "john_plex" },
        { id: 2, displayName: "JaneSmith", email: "jane@example.com", plexUsername: null },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: mockUsers,
        },
      });

      const result = await overseerr.getUserByIdentifier("JANE@EXAMPLE.COM");

      expect(result).toEqual(mockUsers[1]);
    });

    test("should find user by Plex username (case-insensitive)", async () => {
      const mockUsers = [
        { id: 1, displayName: "JohnDoe", email: "john@example.com", plexUsername: "john_plex" },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: mockUsers,
        },
      });

      const result = await overseerr.getUserByIdentifier("JOHN_PLEX");

      expect(result).toEqual(mockUsers[0]);
    });

    test("should return null if user not found", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          results: [],
        },
      });

      const result = await overseerr.getUserByIdentifier("nonexistent");

      expect(result).toBeNull();
    });

    test("should return null on error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("API error"));

      const result = await overseerr.getUserByIdentifier("test");

      expect(result).toBeNull();
    });
  });

  describe("testConnection", () => {
    test("should return success on successful connection", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          version: "1.33.2",
        },
      });

      const result = await overseerr.testConnection();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/v1/status");
      expect(result.success).toBe(true);
      expect(result.version).toBe("1.33.2");
      expect(result.status).toBe("connected");
    });

    test("should return error on connection failure", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Connection refused"));

      const result = await overseerr.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection refused");
    });
  });
});

/**
 * Tests for bullying.js
 * Tests state management, cooldown logic, and universal button press tracking
 */

// Mock messages module
jest.mock("../src/messages", () => ({
  firstPressMessage: (username) => `First press message for ${username}`,
  secondPressMessage: (username) => `Second press message for ${username}`,
}));

const bullying = require("../src/services/bullying");

describe("Bullying Service", () => {
  // Store original Date.now for restoration
  let originalDateNow;

  beforeEach(() => {
    // Clear all trackers before each test
    bullying.clearAllTrackers();
    // Reset bullied user
    bullying.setBulliedUser(null);
    // Store original Date.now
    originalDateNow = Date.now;
  });

  afterEach(() => {
    // Restore Date.now
    Date.now = originalDateNow;
  });

  describe("setBulliedUser & getBulliedUser", () => {
    test("should set the bullied user", () => {
      bullying.setBulliedUser("user123");
      expect(bullying.getBulliedUser()).toBe("user123");
    });

    test("should clear the bullied user when set to null", () => {
      bullying.setBulliedUser("user123");
      bullying.setBulliedUser(null);
      expect(bullying.getBulliedUser()).toBe(null);
    });

    test("should return null when no user is being bullied", () => {
      expect(bullying.getBulliedUser()).toBe(null);
    });
  });

  describe("shouldBullyUser", () => {
    test("should return true when user is the bullied target", () => {
      bullying.setBulliedUser("user123");
      expect(bullying.shouldBullyUser("user123")).toBe(true);
    });

    test("should return false when user is not the bullied target", () => {
      bullying.setBulliedUser("user123");
      expect(bullying.shouldBullyUser("user456")).toBe(false);
    });

    test("should return false when no user is being bullied", () => {
      expect(bullying.shouldBullyUser("user123")).toBe(false);
    });
  });

  describe("processBulliedButtonPress - Basic Flow", () => {
    beforeEach(() => {
      bullying.setBulliedUser("user123");
    });

    test("should return null for non-bullied users", () => {
      const result = bullying.processBulliedButtonPress(
        "user456",
        "watched",
        "550",
        "OtherUser"
      );
      expect(result).toBe(null);
    });

    test("should return first press message on first button click", () => {
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );
      expect(result).toBe("First press message for BulliedUser");
    });

    test("should return second press message on second button click", () => {
      // First press
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      // Second press
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      expect(result).toBe("Second press message for BulliedUser");
    });

    test("should return null (allow action) on third button click", () => {
      // First press
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      // Second press
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      // Third press - should allow
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );
      expect(result).toBe(null);
    });
  });

  describe("processBulliedButtonPress - Universal Cooldown", () => {
    beforeEach(() => {
      bullying.setBulliedUser("user123");
    });

    test("should allow action during cooldown period", () => {
      const mockNow = 1000000000000; // Fixed timestamp
      Date.now = jest.fn(() => mockNow);

      // First three presses to trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      ); // This starts cooldown

      // Try pressing button during cooldown (10 minutes later)
      Date.now = jest.fn(() => mockNow + 10 * 60 * 1000);
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );

      expect(result).toBe(null); // Should allow action during cooldown
    });

    test("should reset and start bullying again after cooldown expires", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Move past cooldown period (31 minutes)
      Date.now = jest.fn(() => mockNow + 31 * 60 * 1000);

      // Next press should be first press again
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );

      expect(result).toBe("First press message for BulliedUser");
    });

    test("should track presses across different button types (universal)", () => {
      bullying.setBulliedUser("user123");

      // First press on "watched" button
      const first = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );
      expect(first).toBe("First press message for BulliedUser");

      // Second press on "watchlist" button (different type)
      const second = bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      expect(second).toBe("Second press message for BulliedUser");

      // Third press on "delete" button (yet another type)
      const third = bullying.processBulliedButtonPress(
        "user123",
        "delete",
        "550",
        "BulliedUser"
      );
      expect(third).toBe(null); // Should allow
    });
  });

  describe("getCooldownRemaining", () => {
    beforeEach(() => {
      bullying.setBulliedUser("user123");
    });

    test("should return 0 when user has no tracker", () => {
      const remaining = bullying.getCooldownRemaining("user999");
      expect(remaining).toBe(0);
    });

    test("should return 0 when user has never been in cooldown", () => {
      // Press button once (not enough to trigger cooldown)
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");

      const remaining = bullying.getCooldownRemaining("user123");
      expect(remaining).toBe(0);
    });

    test("should return correct remaining time during cooldown", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Check cooldown after 5 minutes
      Date.now = jest.fn(() => mockNow + 5 * 60 * 1000);
      const remaining = bullying.getCooldownRemaining("user123");

      // Should have 25 minutes (1,500,000 ms) remaining
      expect(remaining).toBe(25 * 60 * 1000);
    });

    test("should return 0 when cooldown has expired", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Move past cooldown (31 minutes)
      Date.now = jest.fn(() => mockNow + 31 * 60 * 1000);
      const remaining = bullying.getCooldownRemaining("user123");

      expect(remaining).toBe(0);
    });
  });

  describe("getAllCooldowns", () => {
    test("should return null when no user is being bullied", () => {
      const cooldowns = bullying.getAllCooldowns();
      expect(cooldowns).toBe(null);
    });

    test("should return null when bullied user has no tracker", () => {
      bullying.setBulliedUser("user123");
      const cooldowns = bullying.getAllCooldowns();
      expect(cooldowns).toBe(null);
    });

    test("should return null when bullied user has no active cooldown", () => {
      bullying.setBulliedUser("user123");
      // Press button once (not enough to trigger cooldown)
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");

      const cooldowns = bullying.getAllCooldowns();
      expect(cooldowns).toBe(null);
    });

    test("should return cooldown details when active", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      bullying.setBulliedUser("user123");

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Check cooldown after 5 minutes
      Date.now = jest.fn(() => mockNow + 5 * 60 * 1000);
      const cooldowns = bullying.getAllCooldowns();

      expect(cooldowns).not.toBe(null);
      expect(cooldowns.remainingMs).toBe(25 * 60 * 1000);
      expect(cooldowns.remainingMinutes).toBe(25);
      expect(cooldowns.count).toBe(0); // Count is reset during cooldown
    });

    test("should return null when cooldown has expired", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      bullying.setBulliedUser("user123");

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Move past cooldown (31 minutes)
      Date.now = jest.fn(() => mockNow + 31 * 60 * 1000);
      const cooldowns = bullying.getAllCooldowns();

      expect(cooldowns).toBe(null);
    });
  });

  describe("resetAllCooldowns", () => {
    test("should return 0 when no user is being bullied", () => {
      const count = bullying.resetAllCooldowns();
      expect(count).toBe(0);
    });

    test("should return 0 when bullied user has no tracker", () => {
      bullying.setBulliedUser("user123");
      const count = bullying.resetAllCooldowns();
      expect(count).toBe(0);
    });

    test("should reset cooldown for bullied user", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      bullying.setBulliedUser("user123");

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Verify cooldown is active
      expect(bullying.getAllCooldowns()).not.toBe(null);

      // Reset cooldown
      const count = bullying.resetAllCooldowns();
      expect(count).toBe(1);

      // Verify cooldown is cleared
      expect(bullying.getAllCooldowns()).toBe(null);
    });

    test("should allow bullying to start fresh after reset", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      bullying.setBulliedUser("user123");

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Reset cooldown
      bullying.resetAllCooldowns();

      // Next press should be first press again
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );
      expect(result).toBe("First press message for BulliedUser");
    });
  });

  describe("clearAllTrackers", () => {
    test("should clear all tracking data", () => {
      bullying.setBulliedUser("user123");

      // Create some tracking data
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );

      // Clear all trackers
      bullying.clearAllTrackers();

      // Next press should be first press (starting fresh)
      const result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );
      expect(result).toBe("First press message for BulliedUser");
    });
  });

  describe("Edge Cases", () => {
    test("should handle switching bullied user mid-session", () => {
      // Set first user
      bullying.setBulliedUser("user123");
      bullying.processBulliedButtonPress("user123", "watched", "550", "User123");

      // Switch to second user
      bullying.setBulliedUser("user456");

      // First user should no longer be bullied
      const user123Result = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "User123"
      );
      expect(user123Result).toBe(null);

      // Second user should start fresh
      const user456Result = bullying.processBulliedButtonPress(
        "user456",
        "watched",
        "550",
        "User456"
      );
      expect(user456Result).toBe("First press message for User456");
    });

    test("should handle rapid button presses", () => {
      bullying.setBulliedUser("user123");

      // Rapid fire presses
      const first = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );
      const second = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );
      const third = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );
      const fourth = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "550",
        "BulliedUser"
      );

      expect(first).toBe("First press message for BulliedUser");
      expect(second).toBe("Second press message for BulliedUser");
      expect(third).toBe(null); // Allow
      expect(fourth).toBe(null); // Still in cooldown
    });

    test("should handle cooldown boundary conditions", () => {
      const mockNow = 1000000000000;
      Date.now = jest.fn(() => mockNow);

      bullying.setBulliedUser("user123");

      // Trigger cooldown
      bullying.processBulliedButtonPress("user123", "watched", "550", "BulliedUser");
      bullying.processBulliedButtonPress(
        "user123",
        "watchlist",
        "550",
        "BulliedUser"
      );
      bullying.processBulliedButtonPress(
        "user123",
        "watchParty",
        "550",
        "BulliedUser"
      );

      // Exactly at 30 minutes (cooldown boundary)
      Date.now = jest.fn(() => mockNow + 30 * 60 * 1000);
      const atBoundary = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );
      expect(atBoundary).toBe(null); // Should still be in cooldown

      // Just after 30 minutes (cooldown expired)
      Date.now = jest.fn(() => mockNow + 30 * 60 * 1000 + 1);
      const afterBoundary = bullying.processBulliedButtonPress(
        "user123",
        "watched",
        "999",
        "BulliedUser"
      );
      expect(afterBoundary).toBe("First press message for BulliedUser"); // Should reset
    });
  });
});

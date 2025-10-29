/**
 * Bullying Service
 * Tracks button presses for specific users and adds delays/jokes
 */

// The special user who gets bullied (can be changed dynamically)
let BULLIED_USER_ID = null; // null = no one is being bullied

const messages = require("../messages");

// In-memory storage for universal button press tracking (per user)
// Structure: { userId: { count: number, lastReset: timestamp } }
const userTracker = new Map();

// Cooldown period in milliseconds (30 minutes)
const COOLDOWN_MS = 30 * 60 * 1000;

/**
 * Check if user should be bullied
 * @param {string} userId - Discord user ID
 * @returns {boolean}
 */
function shouldBullyUser(userId) {
  return BULLIED_USER_ID !== null && userId === BULLIED_USER_ID;
}

/**
 * Set the user to be bullied (admin only)
 * @param {string} userId - Discord user ID to bully, or null to stop bullying
 */
function setBulliedUser(userId) {
  BULLIED_USER_ID = userId;
  if (userId) {
    console.log(`🎯 Bullying target set to: ${userId}`);
  } else {
    console.log(`✅ Bullying disabled`);
  }
}

/**
 * Get the currently bullied user
 * @returns {string|null} User ID or null
 */
function getBulliedUser() {
  return BULLIED_USER_ID;
}

/**
 * Get or create tracker entry for a user (universal across all buttons)
 * @param {string} userId - Discord user ID
 * @returns {Object} Tracker object
 */
function getTracker(userId) {
  if (!userTracker.has(userId)) {
    userTracker.set(userId, {
      count: 0,
      lastReset: 0, // 0 means "never been in cooldown"
    });
  }

  const tracker = userTracker.get(userId);

  // Check if cooldown has expired (only if lastReset > 0, meaning cooldown was started)
  if (tracker.lastReset > 0) {
    const timeSinceReset = Date.now() - tracker.lastReset;
    if (timeSinceReset > COOLDOWN_MS) {
      // Reset after cooldown
      tracker.count = 0;
      tracker.lastReset = 0; // Back to "never in cooldown" state
    }
  }

  return tracker;
}

/**
 * Process button press for bullying (universal cooldown across all buttons)
 * Returns null if should proceed normally, or a bully message if should block
 * @param {string} userId - Discord user ID
 * @param {string} buttonType - Type of button (watched, watchlist, watchParty, delete)
 * @param {string} movieId - Movie ID (or interaction ID for delete)
 * @param {string} username - Discord username (display name without @)
 * @returns {string|null} Bully message or null to proceed
 */
function processBulliedButtonPress(userId, buttonType, movieId, username) {
  if (!shouldBullyUser(userId)) {
    return null; // Not the bullied user, proceed normally
  }

  const tracker = getTracker(userId);

  // Debug logging
  console.log(
    `[BULLY DEBUG] User: ${userId}, Button: ${buttonType}, Movie: ${movieId}`
  );
  console.log(
    `[BULLY DEBUG] Tracker - count: ${tracker.count}, lastReset: ${new Date(
      tracker.lastReset
    ).toLocaleString()}`
  );

  // Check if we're in cooldown period
  // inCooldown = count is 0, lastReset is set (> 0), and cooldown hasn't expired yet
  const timeSinceReset =
    tracker.lastReset > 0 ? Date.now() - tracker.lastReset : -1;
  const inCooldown =
    tracker.count === 0 &&
    tracker.lastReset > 0 &&
    timeSinceReset < COOLDOWN_MS;

  console.log(
    `[BULLY DEBUG] Time since reset: ${
      timeSinceReset >= 0 ? Math.round(timeSinceReset / 1000) + "s" : "never"
    }, In cooldown: ${inCooldown}`
  );

  if (inCooldown) {
    // During cooldown, let them use the button normally without bullying
    console.log(`[BULLY DEBUG] In cooldown - allowing action`);
    return null;
  }

  // Increment count
  tracker.count++;
  console.log(`[BULLY DEBUG] Incremented count to: ${tracker.count}`);

  // First press - block with joke
  if (tracker.count === 1) {
    const message = messages.firstPressMessage(username);
    console.log(`[BULLY DEBUG] First press - sending message: ${message}`);
    return message;
  }

  // Second press - block with another joke
  if (tracker.count === 2) {
    const message = messages.secondPressMessage(username);
    console.log(`[BULLY DEBUG] Second press - sending message: ${message}`);
    return message;
  }

  // Third press - allow it and start cooldown
  if (tracker.count >= 3) {
    tracker.count = 0; // Reset counter
    tracker.lastReset = Date.now(); // Start 30-minute cooldown
    console.log(
      `[BULLY DEBUG] Third press - allowing action and starting cooldown`
    );
    return null; // Allow action
  }

  return null; // Should not reach here, but proceed if it does
}

/**
 * Get time remaining on cooldown (for debugging/info)
 * @param {string} userId - Discord user ID
 * @returns {number} Milliseconds remaining, or 0 if no cooldown
 */
function getCooldownRemaining(userId) {
  if (!userTracker.has(userId)) {
    return 0;
  }

  const tracker = userTracker.get(userId);
  if (tracker.lastReset === 0) {
    return 0;
  }

  const elapsed = Date.now() - tracker.lastReset;
  const remaining = COOLDOWN_MS - elapsed;

  return Math.max(0, remaining);
}

/**
 * Clear all tracking data (for testing)
 */
function clearAllTrackers() {
  userTracker.clear();
}

/**
 * Get cooldown status for the bullied user (universal cooldown)
 * @returns {Object|null} Cooldown object with details or null if no cooldown
 */
function getAllCooldowns() {
  if (!BULLIED_USER_ID) {
    return null;
  }

  if (!userTracker.has(BULLIED_USER_ID)) {
    return null;
  }

  const tracker = userTracker.get(BULLIED_USER_ID);

  // Only return cooldown if active
  if (tracker.lastReset > 0) {
    const timeSinceReset = Date.now() - tracker.lastReset;
    const remaining = COOLDOWN_MS - timeSinceReset;

    if (remaining > 0) {
      return {
        remainingMs: remaining,
        remainingMinutes: Math.ceil(remaining / (60 * 1000)),
        count: tracker.count,
      };
    }
  }

  return null;
}

/**
 * Reset cooldown for the bullied user (universal cooldown)
 */
function resetAllCooldowns() {
  if (!BULLIED_USER_ID) {
    return 0;
  }

  if (!userTracker.has(BULLIED_USER_ID)) {
    return 0;
  }

  const tracker = userTracker.get(BULLIED_USER_ID);
  tracker.count = 0;
  tracker.lastReset = 0;

  return 1; // Always returns 1 since there's only one universal cooldown now
}

module.exports = {
  shouldBullyUser,
  processBulliedButtonPress,
  getCooldownRemaining,
  clearAllTrackers,
  setBulliedUser,
  getBulliedUser,
  getAllCooldowns,
  resetAllCooldowns,
};

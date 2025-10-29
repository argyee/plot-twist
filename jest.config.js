/**
 * Jest configuration for Discord Movie Bot
 */

module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js"],

  // Coverage configuration
  collectCoverageFrom: [
    "*.js",
    "!node_modules/**",
    "!tests/**",
    "!jest.config.js",
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
};

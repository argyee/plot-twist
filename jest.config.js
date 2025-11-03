/**
 * Jest configuration for Discord Movie Bot
 */

module.exports = {
    // Test environment
    testEnvironment: "node",

    // Test file patterns
    testMatch: ["**/tests/**/*.test.js"],

    // Setup files (run before each test file)
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

    // Coverage configuration
    collectCoverageFrom: [
        "src/**/*.js",              // All JS files in src/ directory
        "!src/bot.js",              // Exclude main entry point (hard to test)
        "!node_modules/**",         // Exclude dependencies
        "!tests/**",                // Exclude tests themselves
        "!jest.config.js",          // Exclude config
        "!coverage/**",             // Exclude coverage reports
    ],

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,
};

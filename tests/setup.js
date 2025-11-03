/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock logger globally to suppress log output during tests
jest.mock("../src/utils/logger", () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
}));

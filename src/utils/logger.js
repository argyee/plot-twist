/**
 * Winston Logger Utility
 * Provides structured logging with multiple transports and formats
 *
 * Log Levels:
 * - error: Critical errors that need immediate attention
 * - warn: Warning messages for potential issues
 * - info: General informational messages
 * - debug: Detailed debugging information (only in development)
 *
 * Usage:
 * const logger = require('./utils/logger');
 * logger.info('Bot started', { username: 'BotName' });
 * logger.error('Connection failed', { error: err.message });
 * logger.success('Command registered', { name: 'movie' });
 */

const winston = require("winston");
const path = require("path");

// Define log format for development (colorful, human-readable)
const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({format: "HH:mm:ss"}),
    winston.format.printf(({timestamp, level, message, ...meta}) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Define log format for production (JSON for parsing/aggregation)
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({stack: true}), // Include stack traces
    winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
    level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    defaultMeta: {service: "discord-moviebot"},
    transports: [],
});

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console());
} else {
    // In production: log to files with size limits
    // Files will be capped at 10MB to prevent unbounded growth
    logger.add(
        new winston.transports.File({
            filename: path.join("logs", "error.log"),
            level: "error",
            maxsize: 10485760, // 10MB
            maxFiles: 3, // Keep 3 files: error.log, error.log.1, error.log.2
        })
    );
    logger.add(
        new winston.transports.File({
            filename: path.join("logs", "combined.log"),
            maxsize: 10485760, // 10MB
            maxFiles: 3, // Keep 3 files: combined.log, combined.log.1, combined.log.2
        })
    );
}

// Add convenience method for success messages (with emoji for consistency)
logger.success = (message, meta = {}) => {
    logger.info(`✅ ${message}`, meta);
};

module.exports = logger;

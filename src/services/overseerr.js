/**
 * Overseerr Service
 * Handles communication with Overseerr API for media requests and availability
 */

const axios = require("axios");
const logger = require("../utils/logger");

const OVERSEERR_URL = process.env.OVERSEERR_URL;
const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;

// Check if Overseerr is configured
const isConfigured = () => {
    return !!(OVERSEERR_URL && OVERSEERR_API_KEY);
};

// Create axios instance with Overseerr configuration
const api = isConfigured()
    ? axios.create({
        baseURL: OVERSEERR_URL,
        headers: {
            "X-Api-Key": OVERSEERR_API_KEY,
            "Content-Type": "application/json",
        },
        timeout: 10000,
    })
    : null;

/**
 * Get movie status from Overseerr
 * @param {string} tmdbId - TMDB movie ID
 * @returns {Promise<Object>} Movie status information
 */
async function getMovieStatus(tmdbId) {
    if (!api) {
        return {available: false, requested: false, processing: false};
    }

    try {
        logger.debug("Checking movie status in Overseerr", {tmdbId});
        const response = await api.get(`/api/v1/movie/${tmdbId}`);
        const mediaInfo = response.data.mediaInfo;

        logger.debug("Received Overseerr response", {
            tmdbId,
            status: mediaInfo?.status,
            status4k: mediaInfo?.status4k,
        });

        // Status codes: 1=UNKNOWN, 2=PENDING, 3=PROCESSING, 4=AVAILABLE, 5=PARTIALLY_AVAILABLE
        const status = mediaInfo?.status || 0;
        const status4k = mediaInfo?.status4k || 0;

        // Consider both AVAILABLE (4) and PARTIALLY_AVAILABLE (5) as available
        const isAvailable = status === 4 || status === 5;
        const is4kAvailable = status4k === 4 || status4k === 5;

        logger.debug("Processed movie status", {
            tmdbId,
            status,
            status4k,
            isAvailable,
            is4kAvailable,
        });

        return {
            available: isAvailable,
            available4k: is4kAvailable,
            requested: status >= 2 && status < 4,
            requested4k: status4k >= 2 && status4k < 4,
            processing: status === 3,
            processing4k: status4k === 3,
            mediaInfo: mediaInfo,
        };
    } catch (error) {
        if (error.response?.status === 404) {
            // Movie not in Overseerr system yet
            logger.debug("Movie not found in Overseerr", {tmdbId});
            return {available: false, requested: false, processing: false};
        }
        logger.error("Error getting movie status from Overseerr", {
            tmdbId,
            error: error.message,
        });
        return {available: false, requested: false, processing: false};
    }
}

/**
 * Create a movie request in Overseerr
 * @param {string} tmdbId - TMDB movie ID
 * @param {string} overseerUserId - Overseerr user ID
 * @param {boolean} is4k - Whether to request 4K quality
 * @returns {Promise<Object>} Request result
 */
async function createMovieRequest(tmdbId, overseerUserId, is4k = false) {
    if (!api) {
        return {
            success: false,
            error: "Overseerr is not configured",
        };
    }

    try {
        const response = await api.post("/api/v1/request", {
            mediaType: "movie",
            mediaId: parseInt(tmdbId),
            is4k: is4k,
            userId: parseInt(overseerUserId),
        });

        logger.info("Movie request created in Overseerr", {
            tmdbId,
            overseerUserId,
            is4k,
            requestId: response.data.id,
        });

        return {
            success: true,
            request: response.data,
            requestId: response.data.id,
        };
    } catch (error) {
        logger.error("Error creating movie request in Overseerr", {
            tmdbId,
            overseerUserId,
            is4k,
            error: error.message,
            status: error.response?.status,
        });

        let errorMessage = "Failed to create request";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 409) {
            errorMessage = "This movie has already been requested";
        } else if (error.response?.status === 403) {
            errorMessage = "You don't have permission to request movies";
        } else if (error.response?.status === 429) {
            errorMessage = "You've reached your request quota";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Get all requests for a specific user
 * @param {string} overseerUserId - Overseerr user ID
 * @returns {Promise<Array>} List of user's requests
 */
async function getUserRequests(overseerUserId) {
    if (!api) {
        return [];
    }

    try {
        const response = await api.get("/api/v1/request", {
            params: {
                take: 50,
                skip: 0,
                filter: "all",
                sort: "added",
                requestedBy: parseInt(overseerUserId),
            },
        });

        return response.data.results || [];
    } catch (error) {
        logger.error("Error getting user requests from Overseerr", {
            overseerUserId,
            error: error.message,
        });
        return [];
    }
}

/**
 * Delete a request
 * @param {string} requestId - Request ID to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteRequest(requestId) {
    if (!api) {
        return {success: false, error: "Overseerr is not configured"};
    }

    try {
        await api.delete(`/api/v1/request/${requestId}`);
        logger.info("Request deleted from Overseerr", {requestId});
        return {success: true};
    } catch (error) {
        logger.error("Error deleting request from Overseerr", {
            requestId,
            error: error.message,
        });
        return {
            success: false,
            error: error.response?.data?.message || "Failed to delete request",
        };
    }
}

/**
 * Get all Overseerr users
 * @returns {Promise<Array>} List of Overseerr users
 */
async function getAllUsers() {
    if (!api) {
        return [];
    }

    try {
        const response = await api.get("/api/v1/user");
        return response.data.results || [];
    } catch (error) {
        logger.error("Error getting users from Overseerr", {
            error: error.message,
        });
        return [];
    }
}

/**
 * Get Overseerr user by username or email
 * @param {string} identifier - Username or email
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserByIdentifier(identifier) {
    if (!api) {
        return null;
    }

    try {
        const users = await getAllUsers();
        const lowerIdentifier = identifier.toLowerCase();

        return (
            users.find(
                (user) =>
                    user.displayName?.toLowerCase() === lowerIdentifier ||
                    user.email?.toLowerCase() === lowerIdentifier ||
                    user.plexUsername?.toLowerCase() === lowerIdentifier
            ) || null
        );
    } catch (error) {
        logger.error("Error finding user in Overseerr", {
            identifier,
            error: error.message,
        });
        return null;
    }
}

/**
 * Test Overseerr connection
 * @returns {Promise<Object>} Connection test result
 */
async function testConnection() {
    if (!api) {
        return {success: false, error: "Overseerr is not configured"};
    }

    try {
        const response = await api.get("/api/v1/status");
        logger.info("Overseerr connection test successful", {
            version: response.data.version,
        });
        return {
            success: true,
            version: response.data.version,
            status: "connected",
        };
    } catch (error) {
        logger.error("Overseerr connection test failed", {
            error: error.message,
        });
        return {
            success: false,
            error: error.message,
        };
    }
}

module.exports = {
    isConfigured,
    getMovieStatus,
    createMovieRequest,
    getUserRequests,
    deleteRequest,
    getAllUsers,
    getUserByIdentifier,
    testConnection,
};

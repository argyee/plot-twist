/**
 * Modal Builder Utility
 * Shared modal creation functions for consistent UX
 */

const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require("discord.js");
const messages = require("../messages");

/**
 * Build request modal for movie quality selection
 * @param {string} movieId - TMDB movie ID
 * @param {string|null} movieTitle - Movie title (optional, for better UX)
 * @param {boolean} isQuickRequest - Whether this is from /request command (vs button)
 * @returns {ModalBuilder} Configured modal
 */
function buildRequestModal(movieId, movieTitle = null, isQuickRequest = false) {
    const customId = isQuickRequest
        ? `quick_request_modal_${movieId}`
        : `request_modal_${movieId}`;

    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(
            movieTitle
                ? messages.request.modalTitleWithMovie(movieTitle)
                : messages.request.modalTitle
        );

    const qualityInput = new TextInputBuilder()
        .setCustomId("quality")
        .setLabel(messages.request.qualityLabel)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(messages.request.qualityPlaceholder)
        .setRequired(false)
        .setMaxLength(3);

    const row = new ActionRowBuilder().addComponents(qualityInput);
    modal.addComponents(row);

    return modal;
}

module.exports = {buildRequestModal};

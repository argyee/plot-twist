/**
 * Button Interaction Router
 * Routes button clicks to appropriate handlers
 */

const {ButtonInteraction} = require("discord.js");
const handleWatchedButton = require("./watched");
const handleWatchlistButton = require("./watchlist");
const handleWatchPartyButton = require("./watchParty");
const {
    handleDeleteButton,
    handleConfirmDelete,
    handleCancelDelete,
} = require("./delete");
const {handleRequestButton} = require("./request");
const messages = require("../../messages");
const logger = require("../../utils/logger");

/**
 * Route button interactions to appropriate handler based on customId
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;

    logger.debug("Button interaction received", {
        customId,
        userId: interaction.user.id,
        user: interaction.user.tag,
    });

    try {
        if (customId.startsWith("watched_")) {
            await handleWatchedButton(interaction);
        } else if (customId.startsWith("watchlist_")) {
            await handleWatchlistButton(interaction);
        } else if (customId.startsWith("watch_party_")) {
            await handleWatchPartyButton(interaction);
        } else if (customId.startsWith("request_")) {
            await handleRequestButton(interaction);
        } else if (customId.startsWith("delete_")) {
            await handleDeleteButton(interaction);
        } else if (customId.startsWith("confirm_delete_")) {
            await handleConfirmDelete(interaction);
        } else if (customId.startsWith("cancel_delete_")) {
            await handleCancelDelete(interaction);
        } else {
            logger.warn("Unknown button interaction", {
                customId,
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
        }
    } catch (error) {
        logger.error("Error handling button interaction", {
            error: error.message,
            stack: error.stack,
            customId,
            userId: interaction.user.id,
            user: interaction.user.tag,
        });
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: messages.errors.genericError,
                ephemeral: true,
            });
        }
    }
}

module.exports = handleButtonInteraction;

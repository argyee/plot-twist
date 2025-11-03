/**
 * Interaction Create Event Handler
 * Routes all Discord interactions to appropriate handlers
 */

const handleMovieCommand = require("../commands/movie");
const handleWatchlistCommand = require("../commands/mywatchlist");
const handleBullyCommand = require("../commands/bully");
const handleOverseerrCommand = require("../commands/overseerr");
const handleMyRequestsCommand = require("../commands/myrequests");
const handleRequestCommand = require("../commands/request");
const handleAutocomplete = require("../handlers/autocomplete");
const handleButtonInteraction = require("../handlers/buttons/index");
const {
    handleRequestModal,
    handleQuickRequestModal,
} = require("../handlers/buttons/request");
const messages = require("../messages");

/**
 * Handle all interaction events
 * @param {Client} client - Discord client instance
 * @param {Interaction} interaction - Discord interaction
 */
module.exports = async (client, interaction) => {
    try {
        // Handle autocomplete interactions
        if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction);
            return;
        }

        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const {commandName} = interaction;

            if (commandName === "movie") {
                await handleMovieCommand(interaction, client);
            } else if (commandName === "mywatchlist") {
                await handleWatchlistCommand(interaction);
            } else if (commandName === "bully") {
                await handleBullyCommand(interaction);
            } else if (commandName === "overseerr") {
                await handleOverseerrCommand.execute(interaction);
            } else if (commandName === "myrequests") {
                await handleMyRequestsCommand.execute(interaction);
            } else if (commandName === "request") {
                await handleRequestCommand.execute(interaction);
            }
            return;
        }

        // Handle button interactions
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
            return;
        }

        // Handle modal submissions
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith("request_modal_")) {
                await handleRequestModal(interaction);
            } else if (interaction.customId.startsWith("quick_request_modal_")) {
                await handleQuickRequestModal(interaction);
            }
            return;
        }
    } catch (error) {
        logger.error("Error handling interaction", {
            error: error.message,
            stack: error.stack,
            interactionType: interaction.type,
        });

        // Try to respond with error message if possible
        if (!interaction.replied && !interaction.deferred) {
            await interaction
                .reply({
                    content: messages.errors.genericError,
                    ephemeral: true,
                })
                .catch((err) => logger.error("Failed to send error reply", {error: err.message}));
        }
    }
};

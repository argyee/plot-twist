/**
 * Request Command
 * Quick movie request to Overseerr without creating a forum post
 */

const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require("discord.js");
const overseerr = require("../services/overseerr");
const {getOverseerLink} = require("../services/database");
const {getMovieDetails} = require("../services/tmdb");
const {buildRequestModal} = require("../utils/mediaRequestModal");
const messages = require("../messages");
const logger = require("../utils/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("request")
        .setDescription(messages.commandRequestDescription)
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription(messages.commandRequestOptionTitle)
                .setRequired(true)
                .setAutocomplete(true)
        ),

    /**
     * Execute /request command
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        logger.debug("Request command executed", {
            userId: interaction.user.id,
            user: interaction.user.tag,
        });

        // Check if Overseerr is configured
        if (!overseerr.isConfigured()) {
            logger.warn("Request command used but Overseerr not configured", {
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
            return await interaction.reply({
                content: messages.overseerr.notConfigured,
                ephemeral: true,
            });
        }

        // Check if user is linked to Overseerr
        const link = getOverseerLink(interaction.user.id);
        if (!link) {
            logger.debug("Request command blocked - user not linked", {
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
            return await interaction.reply({
                content: messages.overseerr.notLinked,
                ephemeral: true,
            });
        }

        const movieId = interaction.options.getString("title");

        logger.debug("Processing movie request", {
            movieId,
            userId: interaction.user.id,
            user: interaction.user.tag,
            overseerUserId: link.overseerr_user_id,
        });

        // Get movie details for better UX
        const movie = await getMovieDetails(movieId);
        if (!movie) {
            logger.warn("Movie not found for request", {
                movieId,
                userId: interaction.user.id,
            });
            return await interaction.reply({
                content: messages.movieNotFound,
                ephemeral: true,
            });
        }

        // Check current status
        const status = await overseerr.getMovieStatus(movieId);

        logger.debug("Movie status checked for request", {
            movieId,
            movieTitle: movie.title,
            available: status.available,
            requested: status.requested,
            processing: status.processing,
            userId: interaction.user.id,
        });

        // If already available, inform user
        if (status.available) {
            logger.info("Request blocked - movie already available", {
                movieId,
                movieTitle: movie.title,
                userId: interaction.user.id,
            });
            return await interaction.reply({
                content: messages.overseerr.alreadyAvailable,
                ephemeral: true,
            });
        }

        // If already requested, inform user
        if (status.requested || status.processing) {
            logger.info("Request blocked - movie already requested", {
                movieId,
                movieTitle: movie.title,
                userId: interaction.user.id,
            });
            return await interaction.reply({
                content: messages.overseerr.alreadyRequested,
                ephemeral: true,
            });
        }

        // Show 4K quality selection modal
        logger.debug("Showing request modal", {
            movieId,
            movieTitle: movie.title,
            userId: interaction.user.id,
        });
        const modal = buildRequestModal(movieId, movie.title, true);
        await interaction.showModal(modal);
    },
};

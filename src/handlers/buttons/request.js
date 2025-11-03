/**
 * Request Button Handler
 * Handles Overseerr movie request button interactions
 */

const {ButtonInteraction} = require("discord.js");
const overseerr = require("../../services/overseerr");
const {getOverseerLink} = require("../../services/database");
const {processBulliedButtonPress} = require("../../services/bullying");
const messages = require("../../messages");
const {buildMovieButtons} = require("../../utils/buttonBuilder");
const {getMovieDetails} = require("../../services/tmdb");
const {buildRequestModal} = require("../../utils/mediaRequestModal");
const logger = require("../../utils/logger");

/**
 * Handle request button interaction
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleRequestButton(interaction) {
    const customId = interaction.customId;
    const [, movieId] = customId.split("_");
    const userId = interaction.user.id;

    logger.debug("Request button pressed", {
        movieId,
        userId,
        user: interaction.user.tag,
    });

    // Check if this user should be bullied
    const bullyMessage = processBulliedButtonPress(
        userId,
        "request",
        movieId,
        interaction.user.displayName
    );
    if (bullyMessage) {
        // Block the action and send bully message
        logger.debug("Request action blocked by bullying system", {
            movieId,
            userId,
            user: interaction.user.tag,
        });
        return await interaction.reply({
            content: bullyMessage,
        });
    }

    // Check if user is linked to Overseerr
    const link = getOverseerLink(userId);
    if (!link) {
        logger.debug("Request blocked - user not linked", {
            movieId,
            userId,
            user: interaction.user.tag,
        });
        return await interaction.reply({
            content: messages.overseerr.notLinked,
            ephemeral: true,
        });
    }

    // Get current movie status
    const status = await overseerr.getMovieStatus(movieId);

    logger.debug("Movie status checked for request button", {
        movieId,
        available: status.available,
        requested: status.requested,
        processing: status.processing,
        userId,
    });

    // If already available, inform user
    if (status.available) {
        logger.debug("Request blocked - movie already available", {
            movieId,
            userId,
        });
        return await interaction.reply({
            content: messages.overseerr.alreadyAvailable,
            ephemeral: true,
        });
    }

    // If already requested, inform user
    if (status.requested || status.processing) {
        logger.debug("Request blocked - movie already requested", {
            movieId,
            userId,
        });
        return await interaction.reply({
            content: messages.overseerr.alreadyRequested,
            ephemeral: true,
        });
    }

    // Show 4K quality selection modal
    logger.debug("Showing request modal from button", {
        movieId,
        userId,
    });
    const modal = buildRequestModal(movieId, null, false);
    await interaction.showModal(modal);
}

/**
 * Handle request modal submission
 * @param {ModalSubmitInteraction} interaction - Discord modal interaction
 */
async function handleRequestModal(interaction) {
    await interaction.deferReply({ephemeral: true});

    const movieId = interaction.customId.split("_")[2];
    const userId = interaction.user.id;
    const qualityInput = interaction.fields.getTextInputValue("quality").toLowerCase();
    const is4k = qualityInput === "4k";

    logger.debug("Request modal submitted", {
        movieId,
        userId,
        user: interaction.user.tag,
        is4k,
    });

    // Get user's Overseerr link
    const link = getOverseerLink(userId);
    if (!link) {
        logger.warn("Request modal blocked - user not linked", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.notLinked,
        });
    }

    // Check status again to prevent double-requests
    const status = await overseerr.getMovieStatus(movieId);
    if (status.available) {
        logger.debug("Request modal blocked - movie already available", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.alreadyAvailable,
        });
    }

    if (status.requested || status.processing) {
        logger.debug("Request modal blocked - movie already requested", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.alreadyRequested,
        });
    }

    // Submit request to Overseerr
    logger.debug("Submitting movie request to Overseerr", {
        movieId,
        userId,
        overseerUserId: link.overseerr_user_id,
        is4k,
    });

    const result = await overseerr.createMovieRequest(
        movieId,
        link.overseerr_user_id,
        is4k
    );

    if (result.success) {
        // Get movie details for the success message
        const movie = await getMovieDetails(movieId);
        const movieTitle = movie ? movie.title : "Movie";

        // Update the button to show "Request Pending"
        try {
            const message = interaction.message;
            const updatedStatus = await overseerr.getMovieStatus(movieId);
            const row = buildMovieButtons(
                movieId,
                message.interaction?.user?.id || userId,
                movie,
                updatedStatus
            );

            await message.edit({
                components: [row],
            });

            logger.debug("Updated request button after submission", {
                movieId,
                movieTitle,
            });
        } catch (error) {
            logger.error("Error updating button after request", {
                error: error.message,
                stack: error.stack,
                movieId,
                userId,
            });
        }

        await interaction.editReply({
            content: messages.overseerr.requestSuccess(movieTitle, is4k),
        });

        logger.info("Movie request created from button", {
            movieTitle,
            movieId,
            discordUser: interaction.user.tag,
            is4k,
        });
    } else {
        logger.error("Movie request failed", {
            movieId,
            userId,
            error: result.error,
            is4k,
        });
        await interaction.editReply({
            content: messages.overseerr.requestFailed(result.error),
        });
    }
}

/**
 * Handle quick request modal submission (from /request command)
 * @param {ModalSubmitInteraction} interaction - Discord modal interaction
 */
async function handleQuickRequestModal(interaction) {
    await interaction.deferReply({ephemeral: true});

    const movieId = interaction.customId.split("_")[3];
    const userId = interaction.user.id;
    const qualityInput = interaction.fields.getTextInputValue("quality").toLowerCase();
    const is4k = qualityInput === "4k";

    logger.debug("Quick request modal submitted", {
        movieId,
        userId,
        user: interaction.user.tag,
        is4k,
    });

    // Get user's Overseerr link
    const link = getOverseerLink(userId);
    if (!link) {
        logger.warn("Quick request blocked - user not linked", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.notLinked,
        });
    }

    // Check status again to prevent double-requests
    const status = await overseerr.getMovieStatus(movieId);
    if (status.available) {
        logger.debug("Quick request blocked - movie already available", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.alreadyAvailable,
        });
    }

    if (status.requested || status.processing) {
        logger.debug("Quick request blocked - movie already requested", {
            movieId,
            userId,
        });
        return await interaction.editReply({
            content: messages.overseerr.alreadyRequested,
        });
    }

    // Submit request to Overseerr
    logger.debug("Submitting quick movie request to Overseerr", {
        movieId,
        userId,
        overseerUserId: link.overseerr_user_id,
        is4k,
    });

    const result = await overseerr.createMovieRequest(
        movieId,
        link.overseerr_user_id,
        is4k
    );

    if (result.success) {
        // Get movie details for the success message
        const movie = await getMovieDetails(movieId);
        const movieTitle = movie ? movie.title : "Movie";

        await interaction.editReply({
            content: messages.overseerr.requestSuccess(movieTitle, is4k),
        });

        logger.info("Movie request created from /request command", {
            movieTitle,
            movieId,
            discordUser: interaction.user.tag,
            is4k,
        });
    } else {
        logger.error("Quick movie request failed", {
            movieId,
            userId,
            error: result.error,
            is4k,
        });
        await interaction.editReply({
            content: messages.overseerr.requestFailed(result.error),
        });
    }
}

module.exports = {
    handleRequestButton,
    handleRequestModal,
    handleQuickRequestModal,
};

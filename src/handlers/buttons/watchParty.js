/**
 * Watch Party Button Handler
 * Handles watch party organization and Discord event creation
 */

const {ButtonStyle, ButtonInteraction} = require("discord.js");
const {
    watchPartyExists,
    getUsersWantingToWatch,
    createWatchParty,
    updateWatchParty,
} = require("../../services/database");
const {buildMovieButtons} = require("../../utils/buttonBuilder");
const config = require("../../services/config");
const messages = require("../../messages");
const {processBulliedButtonPress} = require("../../services/bullying");
const logger = require("../../utils/logger");

/**
 * Handle "Organize Watch Party" button clicks
 * Creates a Discord event for coordinating watch parties
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleWatchPartyButton(interaction) {
    try {
        const movieId = interaction.customId.split("_")[2];

        logger.debug("Watch party button pressed", {
            movieId,
            userId: interaction.user.id,
            user: interaction.user.tag,
        });

        // Check if this user should be bullied
        const bullyMessage = processBulliedButtonPress(
            interaction.user.id,
            "watchParty",
            movieId,
            interaction.user.displayName
        );
        if (bullyMessage) {
            // Block the action and send bully message (public so everyone can see!)
            logger.debug("Watch party action blocked by bullying system", {
                movieId,
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
            return await interaction.reply({
                content: bullyMessage,
            });
        }

        // Check if watch party already exists
        if (watchPartyExists(movieId)) {
            logger.debug("Watch party already exists", {movieId});
            return await interaction.reply({
                content: messages.watchPartyAlreadyExists,
                ephemeral: true,
            });
        }

        await interaction.deferReply({ephemeral: true});

        // Get movie details from embed
        const movieTitle = interaction.message.embeds[0]?.title || "Unknown Movie";
        const movieYear =
            interaction.message.embeds[0]?.fields?.find((f) =>
                f.name.includes("Release Year")
            )?.value || "";

        // Get interested users
        const interestedUsers = getUsersWantingToWatch(movieId);

        logger.debug("Creating watch party", {
            movieId,
            movieTitle,
            movieYear,
            interestedUsersCount: interestedUsers.length,
            organizerId: interaction.user.id,
            organizer: interaction.user.tag,
        });

        // Get the forum thread (the message is already in a forum post thread)
        const thread = interaction.message.channel;

        // Tag all interested users in the thread
        const userMentions = interestedUsers
            .map((u) => `<@${u.user_id}>`)
            .join(" ");

        await thread.send(
            messages.watchPartyCoordination(movieTitle, userMentions)
        );

        // Calculate placeholder date (7 days from now by default)
        const placeholderDate = new Date();
        placeholderDate.setHours(
            placeholderDate.getHours() + config.watchParty.placeholderEventHours
        );

        // Calculate end time based on configured duration
        const endDate = new Date(
            placeholderDate.getTime() +
            config.watchParty.eventDurationHours * 60 * 60 * 1000
        );

        // Create Discord Scheduled Event with placeholder time
        const guild = interaction.guild;
        const scheduledEvent = await guild.scheduledEvents.create({
            name: `Watch Party: ${movieTitle}`,
            scheduledStartTime: placeholderDate,
            scheduledEndTime: endDate,
            privacyLevel: 2, // GUILD_ONLY
            entityType: 3, // EXTERNAL
            description: messages.watchPartyEventDescription(
                interestedUsers.length,
                thread.id
            ),
            entityMetadata: {location: messages.watchPartyEventLocation},
        });

        // Save to database
        createWatchParty(movieId, interaction.message.id, interaction.user.id);
        updateWatchParty(movieId, thread.id, scheduledEvent.id);

        // Update buttons to remove "Organize Watch Party" button
        const authorId =
            interaction.message.interaction?.user?.id || interaction.user.id;
        const movie = {
            imdbUrl: null,
            trailerUrl: null,
        };

        // Extract URLs from existing buttons
        const existingButtons = interaction.message.components[0]?.components || [];
        for (const button of existingButtons) {
            if (button.style === ButtonStyle.Link) {
                if (button.label === messages.buttonIMDB) movie.imdbUrl = button.url;
                if (button.label === messages.buttonTrailer)
                    movie.trailerUrl = button.url;
            }
        }

        const newButtons = buildMovieButtons(movieId, authorId, movie);

        await interaction.message.edit({
            components: [newButtons],
        });

        await interaction.editReply({
            content: messages.watchPartyCreated(movieTitle, scheduledEvent.url),
            ephemeral: true,
        });

        logger.success("Watch party created", {
            movieId,
            movieTitle,
            eventId: scheduledEvent.id,
            eventUrl: scheduledEvent.url,
            threadId: thread.id,
            interestedUsersCount: interestedUsers.length,
            organizerId: interaction.user.id,
            organizer: interaction.user.tag,
            scheduledStartTime: placeholderDate.toISOString(),
        });
    } catch (error) {
        logger.error("Error creating watch party", {
            error: error.message,
            stack: error.stack,
            movieId: interaction.customId.split("_")[2],
            userId: interaction.user.id,
            user: interaction.user.tag,
            customId: interaction.customId,
        });
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: messages.watchPartyError,
                ephemeral: true,
            });
        } else {
            await interaction.editReply({
                content: messages.watchPartyError,
            });
        }
    }
}

module.exports = handleWatchPartyButton;

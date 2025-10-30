/**
 * Request Button Handler
 * Handles Overseerr movie request button interactions
 */

const {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const overseerr = require("../../services/overseerr");
const { getOverseerLink } = require("../../services/database");
const { processBulliedButtonPress } = require("../../services/bullying");
const messages = require("../../messages");
const { buildMovieButtons } = require("../../utils/buttonBuilder");
const { getMovieDetails } = require("../../services/tmdb");

/**
 * Handle request button interaction
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleRequestButton(interaction) {
  const customId = interaction.customId;
  const [, movieId] = customId.split("_");
  const userId = interaction.user.id;

  // Check if this user should be bullied
  const bullyMessage = processBulliedButtonPress(
    userId,
    "request",
    movieId,
    interaction.user.displayName
  );
  if (bullyMessage) {
    // Block the action and send bully message
    return await interaction.reply({
      content: bullyMessage,
    });
  }

  // Check if user is linked to Overseerr
  const link = getOverseerLink(userId);
  if (!link) {
    return await interaction.reply({
      content: messages.overseerr.notLinked,
      ephemeral: true,
    });
  }

  // Get current movie status
  const status = await overseerr.getMovieStatus(movieId);

  // If already available, inform user
  if (status.available) {
    return await interaction.reply({
      content: messages.overseerr.alreadyAvailable,
      ephemeral: true,
    });
  }

  // If already requested, inform user
  if (status.requested || status.processing) {
    return await interaction.reply({
      content: messages.overseerr.alreadyRequested,
      ephemeral: true,
    });
  }

  // Show 4K quality selection modal
  const modal = new ModalBuilder()
    .setCustomId(`request_modal_${movieId}`)
    .setTitle("Request Movie on Plex");

  const qualityInput = new TextInputBuilder()
    .setCustomId("quality")
    .setLabel("Quality (type '4k' for 4K, or leave empty)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Leave empty for 1080p, type '4k' for 4K")
    .setRequired(false)
    .setMaxLength(3);

  const row = new ActionRowBuilder().addComponents(qualityInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

/**
 * Handle request modal submission
 * @param {ModalSubmitInteraction} interaction - Discord modal interaction
 */
async function handleRequestModal(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const movieId = interaction.customId.split("_")[2];
  const userId = interaction.user.id;
  const qualityInput = interaction.fields.getTextInputValue("quality").toLowerCase();
  const is4k = qualityInput === "4k";

  // Get user's Overseerr link
  const link = getOverseerLink(userId);
  if (!link) {
    return await interaction.editReply({
      content: messages.overseerr.notLinked,
    });
  }

  // Check status again to prevent double-requests
  const status = await overseerr.getMovieStatus(movieId);
  if (status.available) {
    return await interaction.editReply({
      content: messages.overseerr.alreadyAvailable,
    });
  }

  if (status.requested || status.processing) {
    return await interaction.editReply({
      content: messages.overseerr.alreadyRequested,
    });
  }

  // Submit request to Overseerr
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
    } catch (error) {
      console.error("[REQUEST] Error updating button:", error.message);
    }

    await interaction.editReply({
      content: messages.overseerr.requestSuccess(movieTitle, is4k),
    });

    // TODO: Replace with proper logging utility
    // console.log(
    //   `[OVERSEERR] Request created: ${movieTitle} by ${interaction.user.tag}${is4k ? " (4K)" : ""}`
    // );
  } else {
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
  await interaction.deferReply({ ephemeral: true });

  const movieId = interaction.customId.split("_")[3];
  const userId = interaction.user.id;
  const qualityInput = interaction.fields.getTextInputValue("quality").toLowerCase();
  const is4k = qualityInput === "4k";

  // Get user's Overseerr link
  const link = getOverseerLink(userId);
  if (!link) {
    return await interaction.editReply({
      content: messages.overseerr.notLinked,
    });
  }

  // Check status again to prevent double-requests
  const status = await overseerr.getMovieStatus(movieId);
  if (status.available) {
    return await interaction.editReply({
      content: messages.overseerr.alreadyAvailable,
    });
  }

  if (status.requested || status.processing) {
    return await interaction.editReply({
      content: messages.overseerr.alreadyRequested,
    });
  }

  // Submit request to Overseerr
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

    // TODO: Replace with proper logging utility
    // console.log(
    //   `[OVERSEERR] Quick request created: ${movieTitle} by ${interaction.user.tag}${is4k ? " (4K)" : ""}`
    // );
  } else {
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

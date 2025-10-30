/**
 * Request Command
 * Quick movie request to Overseerr without creating a forum post
 */

const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const overseerr = require("../services/overseerr");
const { getOverseerLink } = require("../services/database");
const { getMovieDetails } = require("../services/tmdb");
const messages = require("../messages");

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
    // Check if Overseerr is configured
    if (!overseerr.isConfigured()) {
      return await interaction.reply({
        content: messages.overseerr.notConfigured,
        ephemeral: true,
      });
    }

    // Check if user is linked to Overseerr
    const link = getOverseerLink(interaction.user.id);
    if (!link) {
      return await interaction.reply({
        content: messages.overseerr.notLinked,
        ephemeral: true,
      });
    }

    const movieId = interaction.options.getString("title");

    // Get movie details for better UX
    const movie = await getMovieDetails(movieId);
    if (!movie) {
      return await interaction.reply({
        content: messages.errors.movieNotFound,
        ephemeral: true,
      });
    }

    // Check current status
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
      .setCustomId(`quick_request_modal_${movieId}`)
      .setTitle(`Request: ${movie.title}`);

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
  },
};

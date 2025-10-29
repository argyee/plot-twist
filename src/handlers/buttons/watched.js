/**
 * Watched Button Handler
 * Handles "Watched" button clicks for tracking watched movies
 */

const { ButtonInteraction } = require("discord.js");
const {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getMovieStatusCount,
} = require("../../services/database");
const config = require("../../services/config");
const messages = require("../../messages");
const { processBulliedButtonPress } = require("../../services/bullying");

/**
 * Handle "Watched" button clicks
 * Toggles movie in user's watched list and adds reaction
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleWatchedButton(interaction) {
  try {
    const movieId = interaction.customId.split("_")[2];
    const userId = interaction.user.id;

    // Check if this user should be bullied
    const bullyMessage = processBulliedButtonPress(
      userId,
      "watched",
      movieId,
      interaction.user.displayName
    );
    if (bullyMessage) {
      // Block the action and send bully message (public so everyone can see!)
      return await interaction.reply({
        content: bullyMessage,
      });
    }

    // Check if already in watchlist
    const alreadyWatched = isInWatchlist(userId, movieId, "watched");

    if (alreadyWatched) {
      // Remove from watched list (toggle off)
      removeFromWatchlist(userId, movieId, "watched");
      const watchedCount = getMovieStatusCount(movieId, "watched");

      await interaction.reply({
        content: messages.removedFromWatched(watchedCount),
        ephemeral: true,
      });
    } else {
      // Get movie title from the embed
      const movieTitle = interaction.message.embeds[0]?.title || "Unknown";
      const movieYear =
        interaction.message.embeds[0]?.fields?.find((f) =>
          f.name.includes("Release Year")
        )?.value || "N/A";

      // Add to watchlist
      addToWatchlist(userId, movieId, movieTitle, movieYear, "watched");

      // Add reaction to the message
      await interaction.message.react(config.trackingEmojis.watched);

      // Get count of people who watched
      const watchedCount = getMovieStatusCount(movieId, "watched");

      await interaction.reply({
        content: messages.markedAsWatched(watchedCount),
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error handling watched button:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: messages.watchedError,
        ephemeral: true,
      });
    }
  }
}

module.exports = handleWatchedButton;

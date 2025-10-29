/**
 * Watchlist Button Handler
 * Handles "Want to Watch" button clicks with toggle functionality
 */

const {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getMovieStatusCount,
} = require("../../services/database");
const { buildMovieButtons } = require("../../utils/buttonBuilder");
const config = require("../../services/config");
const messages = require("../../messages");
const { processBulliedButtonPress } = require("../../services/bullying");

/**
 * Handle "Want to Watch" button clicks
 * Toggles user's watchlist status and triggers watch party notification if threshold reached
 * @param {Interaction} interaction - Discord button interaction
 */
async function handleWatchlistButton(interaction) {
  try {
    const movieId = interaction.customId.split("_")[2];
    const userId = interaction.user.id;

    // Check if this user should be bullied
    const bullyMessage = processBulliedButtonPress(
      userId,
      "watchlist",
      movieId,
      interaction.user.displayName
    );
    if (bullyMessage) {
      // Block the action and send bully message (public so everyone can see!)
      return await interaction.reply({
        content: bullyMessage,
      });
    }

    const alreadyInWatchlist = isInWatchlist(userId, movieId, "want_to_watch");

    if (alreadyInWatchlist) {
      // Remove from watchlist
      removeFromWatchlist(userId, movieId, "want_to_watch");
      const watchlistCount = getMovieStatusCount(movieId, "want_to_watch");

      await interaction.reply({
        content: messages.removedFromWatchlist(watchlistCount),
        ephemeral: true,
      });

      // Update buttons to remove watch party button if count drops below threshold
      const authorId =
        interaction.message.interaction?.user?.id ||
        interaction.customId.split("_")[1];
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      // Extract URLs from existing buttons
      const existingButtons =
        interaction.message.components[0]?.components || [];
      for (const button of existingButtons) {
        if (button.style === 5) {
          // ButtonStyle.Link = 5
          if (button.label === messages.buttonIMDB) movie.imdbUrl = button.url;
          if (button.label === messages.buttonTrailer)
            movie.trailerUrl = button.url;
        }
      }

      const newButtons = buildMovieButtons(movieId, authorId, movie);
      await interaction.message.edit({
        components: [newButtons],
      });
    } else {
      // Add to watchlist
      const movieTitle = interaction.message.embeds[0]?.title || "Unknown";
      const movieYear =
        interaction.message.embeds[0]?.fields?.find((f) =>
          f.name.includes("Release Year")
        )?.value || "N/A";

      addToWatchlist(userId, movieId, movieTitle, movieYear, "want_to_watch");
      await interaction.message.react(config.trackingEmojis.wantToWatch);

      const watchlistCount = getMovieStatusCount(movieId, "want_to_watch");

      await interaction.reply({
        content: messages.addedToWatchlist(watchlistCount),
        ephemeral: true,
      });

      // Check if threshold reached for watch party
      const authorId =
        interaction.message.interaction?.user?.id ||
        interaction.customId.split("_")[1];
      const movie = {
        imdbUrl: null,
        trailerUrl: null,
      };

      // Extract URLs from existing buttons
      const existingButtons =
        interaction.message.components[0]?.components || [];
      for (const button of existingButtons) {
        if (button.style === 5) {
          // ButtonStyle.Link = 5
          if (button.label === messages.buttonIMDB) movie.imdbUrl = button.url;
          if (button.label === messages.buttonTrailer)
            movie.trailerUrl = button.url;
        }
      }

      const newButtons = buildMovieButtons(movieId, authorId, movie);
      await interaction.message.edit({
        components: [newButtons],
      });

      // Send notification if threshold just reached
      if (
        config.watchParty.dynamicCount &&
        watchlistCount === config.watchParty.threshold
      ) {
        const thread = interaction.message.channel;
        await thread.send(
          messages.watchPartyThresholdReached(movieTitle, watchlistCount)
        );
        console.log(
          `🎉 Watch party threshold reached for "${movieTitle}" (${watchlistCount} people interested)`
        );
      }
    }
  } catch (error) {
    console.error("Error handling watchlist button:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: messages.watchlistError,
        ephemeral: true,
      });
    }
  }
}

module.exports = handleWatchlistButton;

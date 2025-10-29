/**
 * My Watchlist Command Handler
 * Shows user's watched movies and watchlist
 */

const { EmbedBuilder } = require("discord.js");
const { getUserWatchlist } = require("../services/database");
const messages = require("../messages");

/**
 * Handle /mywatchlist command
 * Shows user's watched movies and want-to-watch list
 * @param {Interaction} interaction - Discord command interaction
 */
async function handleWatchlistCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userId = interaction.user.id;

    // Get watched movies
    const watchedMovies = getUserWatchlist(userId, "watched");
    const wantToWatchMovies = getUserWatchlist(userId, "want_to_watch");

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(messages.watchlistTitle(interaction.user.username))
      .setColor(0x01d277)
      .setTimestamp();

    // Add watched movies section
    if (watchedMovies.length > 0) {
      const watchedList = watchedMovies
        .slice(0, 10) // Limit to 10 most recent
        .map((movie) => `• **${movie.movie_title}** (${movie.movie_year})`)
        .join("\n");

      embed.addFields({
        name: `${messages.watchedMoviesHeader} (${watchedMovies.length})`,
        value:
          watchedList +
          (watchedMovies.length > 10
            ? `\n_...and ${watchedMovies.length - 10} more_`
            : ""),
        inline: false,
      });
    } else {
      embed.addFields({
        name: `${messages.watchedMoviesHeader} (0)`,
        value: messages.noWatchedMovies,
        inline: false,
      });
    }

    // Add want to watch section
    if (wantToWatchMovies.length > 0) {
      const watchlistList = wantToWatchMovies
        .slice(0, 10) // Limit to 10 most recent
        .map((movie) => `• **${movie.movie_title}** (${movie.movie_year})`)
        .join("\n");

      embed.addFields({
        name: `${messages.watchlistHeader} (${wantToWatchMovies.length})`,
        value:
          watchlistList +
          (wantToWatchMovies.length > 10
            ? `\n_...and ${wantToWatchMovies.length - 10} more_`
            : ""),
        inline: false,
      });
    } else {
      embed.addFields({
        name: `${messages.watchlistHeader} (0)`,
        value: messages.noWatchlistMovies,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error showing watchlist:", error);
    await interaction.editReply({
      content: "❌ An error occurred while fetching your watchlist.",
    });
  }
}

module.exports = handleWatchlistCommand;

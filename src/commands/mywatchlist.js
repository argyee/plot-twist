/**
 * My Watchlist Command Handler
 * Shows user's watched movies and watchlist
 */

const {EmbedBuilder, ChatInputCommandInteraction} = require("discord.js");
const {getUserWatchlist} = require("../services/database");
const messages = require("../messages");
const logger = require("../utils/logger");

/**
 * Handle /mywatchlist command
 * Shows user's watched movies and want-to-watch list
 * @param {ChatInputCommandInteraction} interaction - Discord command interaction
 */
async function handleWatchlistCommand(interaction) {
    await interaction.deferReply({ephemeral: true});

    try {
        const userId = interaction.user.id;

        logger.debug("Fetching user watchlist", {
            userId,
            user: interaction.user.tag,
        });

        // Get watched movies
        /** @type {Array<{movie_title: string, movie_year: number}>} */
        const watchedMovies = getUserWatchlist(userId, "watched");
        /** @type {Array<{movie_title: string, movie_year: number}>} */
        const wantToWatchMovies = getUserWatchlist(userId, "want_to_watch");

        logger.debug("Watchlist fetched", {
            userId,
            user: interaction.user.tag,
            watchedCount: watchedMovies.length,
            wantToWatchCount: wantToWatchMovies.length,
        });

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

        await interaction.editReply({embeds: [embed]});
    } catch (error) {
        logger.error("Error showing watchlist", {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            user: interaction.user.tag,
        });
        await interaction.editReply({
            content: messages.errors.watchlistError,
        });
    }
}

module.exports = handleWatchlistCommand;

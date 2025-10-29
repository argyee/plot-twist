/**
 * Button Builder Utility
 * Creates button rows for movie posts
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const messages = require("../messages");
const config = require("../services/config");
const {
  getMovieStatusCount,
  watchPartyExists,
} = require("../services/database");

/**
 * Build button row for movie post
 * Creates buttons dynamically based on movie data and watch party status
 * @param {string} movieId - TMDB movie ID
 * @param {string} authorId - User ID of post author
 * @param {Object} movie - Movie details object
 * @returns {ActionRowBuilder} Button row component
 */
function buildMovieButtons(movieId, authorId, movie) {
  const buttons = [
    new ButtonBuilder()
      .setCustomId(`watched_${authorId}_${movieId}`)
      .setLabel(messages.buttonWatched)
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`watchlist_${authorId}_${movieId}`)
      .setLabel(messages.buttonWantToWatch)
      .setEmoji("📌")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`delete_${authorId}`)
      .setLabel(messages.buttonDelete)
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger),
  ];

  // Check if watch party button should be shown
  const wantToWatchCount = getMovieStatusCount(movieId, "want_to_watch");
  const hasWatchParty = watchPartyExists(movieId);
  const showWatchParty =
    config.watchParty.dynamicCount &&
    wantToWatchCount >= config.watchParty.threshold &&
    !hasWatchParty;

  // Add IMDB button if available
  if (movie.imdbUrl) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(messages.buttonIMDB)
        .setURL(movie.imdbUrl)
        .setStyle(ButtonStyle.Link)
        .setEmoji("⭐")
    );
  }

  // Add Trailer button if available (but not if watch party button will show - 5 button limit)
  if (movie.trailerUrl && !showWatchParty) {
    buttons.push(
      new ButtonBuilder()
        .setLabel(messages.buttonTrailer)
        .setURL(movie.trailerUrl)
        .setStyle(ButtonStyle.Link)
        .setEmoji("🎥")
    );
  }

  // Add watch party button if threshold reached
  if (showWatchParty) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`watch_party_${movieId}`)
        .setLabel(messages.buttonWatchParty(wantToWatchCount))
        .setEmoji("🎉")
        .setStyle(ButtonStyle.Success)
    );
  }

  return new ActionRowBuilder().addComponents(...buttons);
}

module.exports = { buildMovieButtons };

/**
 * English Messages
 * All user-facing text in English
 */

module.exports = {
  // ============================================================================
  // SLASH COMMAND DESCRIPTIONS
  // ============================================================================
  // Used in: registerCommands()
  commandMovieDescription: "Create a movie discussion post",
  commandMovieTitleDescription: "Movie title to search for",
  commandWatchlistDescription: "View your watched movies and watchlist",

  // ============================================================================
  // MOVIE COMMAND
  // ============================================================================
  // Used in: createMoviePost()
  movieChannelNotFound:
    "❌ Movie forum channel not found or is not a forum channel.",
  movieCreated: (title, url) =>
    `✅ Created discussion for **${title}**!\n${url}`,
  movieNotFound: "❌ Movie not found. Try searching with a different title.",
  movieCreationError: "❌ Failed to create movie post. Please try again.",

  // ============================================================================
  // WATCHLIST COMMAND
  // ============================================================================
  // Used in: showWatchlist()
  watchlistTitle: (username) => `${username}'s Movie Lists`,
  watchedMoviesHeader: "🎬 Watched Movies",
  noWatchedMovies: "No movies watched yet.",
  watchlistHeader: "📌 Want to Watch",
  noWatchlistMovies: "No movies in watchlist yet.",
  watchlistFooter: "Use /movie to add more movies!",

  // ============================================================================
  // DELETE BUTTON
  // ============================================================================
  // Used in: handleDeleteButton(), handleConfirmDelete(), handleCancelDelete()
  deleteOnlyAuthor: "❌ Only the post author can delete this post.",
  deleteConfirmation:
    "⚠️ Are you sure you want to delete this post? This cannot be undone.",
  deleteOnlyAuthorConfirm: "❌ Only the post author can delete this post.",
  postDeleted: "✅ Post deleted successfully.",
  deleteError: "❌ Failed to delete post. It may have already been deleted.",
  deleteCancelled: "✅ Delete cancelled.",

  // ============================================================================
  // WATCHED BUTTON
  // ============================================================================
  // Used in: handleWatchedButton()
  removedFromWatched: (count) =>
    `✅ Removed from watched. (${count} ${
      count === 1 ? "person has" : "people have"
    } watched this)`,
  markedAsWatched: (count) =>
    `✅ Marked as watched! (${count} ${
      count === 1 ? "person has" : "people have"
    } watched this)`,
  watchedError: "❌ Failed to update. Please try again.",

  // ============================================================================
  // WATCH PARTY BUTTON
  // ============================================================================
  // Used in: handleWatchPartyButton()
  watchPartyAlreadyExists:
    "❌ A watch party has already been organized for this movie! Check the thread above.",
  watchPartyCreated: (movieTitle, eventUrl) =>
    `🎉 **Watch party organized!**\n\n` +
    `Check the thread above for coordination details.\n` +
    `Event created: ${eventUrl}`,
  watchPartyCoordination: (movieTitle, userMentions) =>
    `🎉 **Watch Party for ${movieTitle}**!\n\n` +
    `${userMentions} have expressed interest!\n\n` +
    `**Discuss below:**\n` +
    `• When works for everyone?\n` +
    `• Plex watch party or Discord screen share?\n` +
    `• Any specific preferences?\n\n` +
    `React with ✅ when you've confirmed you can make it!`,
  watchPartyEventDescription: (count, threadId) =>
    `⚠️ PLACEHOLDER TIME - Edit this event after coordinating in the thread!\n\n` +
    `${count} people want to watch this!\n\n` +
    `Discuss timing in the thread:\n<#${threadId}>`,
  watchPartyEventLocation: "Plex / Discord",
  watchPartyError: "❌ Failed to create watch party. Please try again.",

  // ============================================================================
  // WATCHLIST BUTTON
  // ============================================================================
  // Used in: handleWatchlistButton()
  removedFromWatchlist: (count) =>
    `📌 Removed from your watchlist. (${count} ${
      count === 1 ? "person wants" : "people want"
    } to watch this)`,
  addedToWatchlist: (count) =>
    `📌 Added to your watchlist! (${count} ${
      count === 1 ? "person wants" : "people want"
    } to watch this)`,
  watchPartyThresholdReached: (userMentions, count) =>
    `🎉 ${userMentions} - **${count} ${
      count === 1 ? "person wants" : "people want"
    } to watch this movie!**\n\n` +
    `Click the "Organize Watch Party" button above to coordinate a watch party!`,
  watchlistError: "❌ Failed to update watchlist. Please try again.",

  // ============================================================================
  // BUTTON LABELS
  // ============================================================================
  // Used in: buildMovieButtons()
  buttonWatched: "Watched",
  buttonWantToWatch: "Want to Watch",
  buttonDelete: "Delete Post",
  buttonIMDB: "IMDB",
  buttonTrailer: "Trailer",
  buttonWatchParty: (count) => `Organize Watch Party (${count} interested)`,
  buttonConfirmDelete: "Yes, Delete",
  buttonCancelDelete: "Cancel",

  // ============================================================================
  // BULLYING MESSAGES
  // ============================================================================
  // Used in: processBulliedButtonPress()
  firstPressMessage: (username) =>
    `Everyone, ${username} is trying to touch me.`,
  secondPressMessage: (username) =>
    `${username} still trying to press my buttons.`,
};

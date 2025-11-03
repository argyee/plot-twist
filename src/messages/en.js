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
    commandRequestDescription: "Request a movie on Plex without creating a post",
    commandRequestOptionTitle: "Movie title to request",

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

    // Movie embed field labels
    movieEmbed: {
        releaseYear: "📅 Release Year",
        rating: "⭐ Rating",
        runtime: "⏱️ Runtime",
        cast: "🎭 Cast",
        director: "🎬 Director",
        genres: "🎪 Genres",
        footerDefault: "Data from TMDB",
        footerAvailable: "🟢 Available on Plex | Data from TMDB",
        footerPending: "🟡 Request Pending | Data from TMDB",
    },

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
    buttonRequestOnPlex: "Request on Plex",
    buttonRequestPending: "Request Pending",
    buttonAvailableOnPlex: "Available on Plex",

    // ============================================================================
    // BULLYING MESSAGES
    // ============================================================================
    // Used in: processBulliedButtonPress()
    firstPressMessage: (username) =>
        `Everyone, ${username} is trying to touch me.`,
    secondPressMessage: (username) =>
        `${username} still trying to press my buttons.`,

    // ============================================================================
    // OVERSEERR MESSAGES
    // ============================================================================
    overseerr: {
        // Linking messages
        notLinked:
            "❌ You haven't linked your Plex account yet! Ask an admin to link your account using `/overseerr link`.",
        notLinkedUser: (username) =>
            `❌ ${username} is not linked to an Overseerr account.`,
        alreadyLinked: (username, overseerUsername) =>
            `❌ ${username} is already linked to Overseerr account: **${overseerUsername}**`,
        linkSuccess: (username, overseerUsername) =>
            `✅ Successfully linked ${username} to Overseerr account: **${overseerUsername}**`,
        linkFailed: "❌ Failed to create link. Please try again.",
        unlinkSuccess: (username) =>
            `✅ Successfully unlinked ${username} from Overseerr.`,
        unlinkFailed: "❌ Failed to remove link. Please try again.",
        userNotFound: (identifier) =>
            `❌ No Overseerr user found with identifier: **${identifier}**\n\nMake sure the user has logged into Overseerr at least once.`,

        // Request messages
        requestSuccess: (title, is4k) =>
            `✅ **${title}** has been requested${is4k ? " in 4K" : ""}! You'll be notified when it's available.`,
        requestFailed: (error) => `❌ Failed to request movie: ${error}`,
        alreadyAvailable: "🟢 This movie is already available on Plex!",
        alreadyRequested:
            "🟡 This movie has already been requested. It will be added soon!",
        cancelSuccess: "✅ Request cancelled successfully.",
        cancelFailed: (error) => `❌ Failed to cancel request: ${error}`,

        // My requests
        noRequests:
            "You haven't requested any movies yet. Click the 'Request on Plex' button on any movie post to request it!",

        // Admin messages
        notConfigured:
            "❌ Overseerr is not configured. Please set OVERSEERR_URL and OVERSEERR_API_KEY in your .env file.",
        connectionSuccess: (version) =>
            `✅ Connected to Overseerr successfully!\n\n**Version:** ${version}`,
        connectionFailed: (error) =>
            `❌ Failed to connect to Overseerr:\n${error}`,
        noLinks: "No users are currently linked to Overseerr accounts.",
        linkedAccountsList: (count) => `**Linked Overseerr Accounts (${count}):**`,
    },

    // ============================================================================
    // REQUEST COMMAND & MODAL
    // ============================================================================
    // Used in: /request command, request modal
    request: {
        modalTitle: "Request Movie on Plex",
        modalTitleWithMovie: (title) => `Request: ${title}`,
        qualityLabel: "Quality (type '4k' for 4K, or leave empty)",
        qualityPlaceholder: "Leave empty for 1080p, type '4k' for 4K",
    },

    // ============================================================================
    // MY REQUESTS COMMAND
    // ============================================================================
    // Used in: /myrequests command
    myRequests: {
        commandDescription: "View your Overseerr movie requests",
        title: "📥 Your Movie Requests",
        linkedAs: (username) => `Linked as ${username}`,
        pendingStatus: (count) => `🟡 Pending (${count})`,
        approvedStatus: (count) => `🔵 Approved/Processing (${count})`,
        availableStatus: (count) => `🟢 Available (${count})`,
        showingCount: (shown, total) => `Showing ${shown} of ${total} requests`,
    },

    // ============================================================================
    // BULLYING COMMAND
    // ============================================================================
    // Used in: /bully command
    bully: {
        noPermission: "❌ You need Administrator permission to use this command.",
        enabled: (userTag, userId) =>
            `🎯 Bullying enabled for ${userTag} (${userId})\n\nThey will now need to click buttons 3 times before they work! 😈`,
        noBulliedUser: "❌ No one is currently being bullied.",
        disabled: "✅ Bullying disabled. Everyone can use buttons normally now.",
        statusNone: "ℹ️ No one is currently being bullied.",
        statusActive: (userId) => `🎯 Currently bullying: <@${userId}> (${userId})`,
        noCooldown: "✅ No active cooldown.",
        cooldownStatus: (userId, minutes) =>
            `⏱️ Universal cooldown for <@${userId}>:\n\n⏰ ${minutes} minute(s) remaining`,
        cooldownReset: (userId) =>
            `✅ Reset cooldown for <@${userId}>.\n\nThey will be bullied again on their next button click! 😈`,
        noCooldownToReset: (userId) => `ℹ️ No cooldown to reset for <@${userId}>.`,
    },

    // ============================================================================
    // OVERSEERR ADMIN COMMAND DESCRIPTIONS
    // ============================================================================
    // Used in: /overseerr command registration
    overseerrCommand: {
        description: "Manage Overseerr integration",
        linkDescription: "Link a Discord user to their Overseerr account",
        linkUserOption: "Discord user to link",
        linkIdentifierOption: "Overseerr username or Plex email",
        unlinkDescription: "Unlink a Discord user from Overseerr",
        unlinkUserOption: "Discord user to unlink",
        statusDescription: "Check Overseerr connection status",
        listDescription: "List all linked accounts",
    },

    // ============================================================================
    // GENERIC ERROR MESSAGES
    // ============================================================================
    errors: {
        genericError: "❌ An error occurred processing your request.",
        watchlistError: "❌ An error occurred while fetching your watchlist.",
        movieNotFound: "❌ Movie not found. Try searching with a different title.",
        deleteProcessError: "❌ Failed to process delete request. Please try again.",
        deleteError: "❌ Failed to delete post. Please try again.",
        deletingPost: "🗑️ Deleting post...",
    },
};

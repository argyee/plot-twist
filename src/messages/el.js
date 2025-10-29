/**
 * All user-facing text in Greek
 *
 * TRANSLATE: Replace English text with Greek while keeping:
 * - Variable placeholders: ${title}, ${count}, ${username}, etc.
 * - Function structure: (param) => `template string`
 * - Emojis (optional to keep or change)
 */

module.exports = {
  // ============================================================================
  // SLASH COMMAND DESCRIPTIONS
  // ============================================================================
  // Used in: registerCommands()
  commandMovieDescription: "Φτιάξε ποστ για συζήτηση ταινίας.",
  commandMovieTitleDescription: "Τίτλος ταινίας",
  commandWatchlistDescription: "Δες τι έχεις δει και τι θέλεις να δεις.",

  // ============================================================================
  // MOVIE COMMAND
  // ============================================================================
  // Used in: createMoviePost()
  movieChannelNotFound: "❌ Ώπα, που σκατά πήγε το φόρουμ?",
  movieCreated: (title, url) => `✅ Έφτιαξα συζήτηση **${title}**!\n${url}`,
  movieNotFound: "❌ Δεν βρήκα την ταινία, πάμε πάλι.",
  movieCreationError: "❌ Έλουσα, πάμε πάλι.",

  // ============================================================================
  // WATCHLIST COMMAND
  // ============================================================================
  // Used in: showWatchlist()
  watchlistTitle: (username) => `${username}'s Movie Lists`,
  watchedMoviesHeader: "🎬 Τι έχεις δει?",
  noWatchedMovies: "Δεν έχεις δει τίποτα, ουάου.",
  watchlistHeader: "📌 Θέλω να το δω!",
  noWatchlistMovies: "Δεν έχεις ταινίες στο watchlist ρε στόκε",
  watchlistFooter: "Δοκίμασε /movie για να περισσότερες ταινίες!",

  // ============================================================================
  // DELETE BUTTON
  // ============================================================================
  // Used in: handleDeleteButton(), handleConfirmDelete(), handleCancelDelete()
  deleteOnlyAuthor: "❌ Μην είσαι τέτοιος, δεν είναι δικό σου ποστ.",
  deleteConfirmation: "⚠️ Σίγουρα ρε; Δεν μπορώ να το ξε-κάνω.",
  deleteOnlyAuthorConfirm: "❌ Μην είσαι τέτοιος, δεν είναι δικό σου ποστ.",
  postDeleted: "✅ Το σούταρα.",
  deleteError: "❌ Έλουσα με την διαγραφή.",
  deleteCancelled: "✅ Οκ, δεν στο διαγράφω.",

  // ============================================================================
  // WATCHED BUTTON
  // ============================================================================
  // Used in: handleWatchedButton()
  removedFromWatched: (count) =>
    `✅ Δεν πειράζει, όλοι κάνουμε λάθη. (${count} ${
      count === 1 ? "μάγκας θέλει να το δει!" : "μάγκες θέλουν να το δουν"
    })`,
  markedAsWatched: (count) =>
    `✅ Οκ το έχεις δει, χάρηκες? (${count} ${
      count === 1 ? "μάγκας το έχει δει." : "μάγκες το έχουν δει"
    })`,
  watchedError: "❌ Έλουσα με την ενημέρωση, πάμε πάλι.",

  // ============================================================================
  // WATCH PARTY BUTTON
  // ============================================================================
  // Used in: handleWatchPartyButton()
  watchPartyAlreadyExists:
    "❌ Υπάρχει ήδη ταινιοπάρτυ για αυτή την ταινία, τσέκαρε το θρεντ!",
  watchPartyCreated: (movieTitle, eventUrl) =>
    `🎉 **Έφτιαξα ταινιοπάρτυ!**\n\n` +
    `Τσέκαρε το θρεντ για λεπτομέρειες.\n` +
    `Ιβεντ: ${eventUrl}`,
  watchPartyCoordination: (movieTitle, userMentions) =>
    `🎉 **Ταινιοπάρτυ για ${movieTitle}**!\n\n` +
    `${userMentions} θέλουν να το δουν!\n\n` +
    `**Έλα, συζητείστε:**\n` +
    `• Πότε?\n` +
    `• Plex ή Discord Screenshare?\n` +
    `• Προτιμήσεις?\n\n` +
    `Πάτα ✅ αν θα συμμετέχεις!`,
  watchPartyEventDescription: (count, threadId) =>
    `⚠️ ΠΡΟΣΩΡΙΝΟ - Κάντε έντιτ ανάλογα!\n\n` +
    `${count} μάγκες θέλουν να το δουν!\n\n` +
    `Κανονίστε για την ώρα στο:\n<#${threadId}>`,
  watchPartyEventLocation: "Plex / Discord",
  watchPartyError: "❌ Έλουσα με την δημιουργία ταινιοπάρτυ, πάμε πάλι.",

  // ============================================================================
  // WATCHLIST BUTTON
  // ============================================================================
  // Used in: handleWatchlistButton()
  removedFromWatchlist: (count) =>
    `📌 Το σούταρα απο το watchlist σου. (${count} ${
      count === 1 ? "μάγκας θέλει να το δει" : "μάγκες θέλουν να το δουν."
    })`,
  addedToWatchlist: (count) =>
    `📌 Το έβαλα στο watchlist σου! (${count} ${
      count === 1 ? "μάγκας θέλει να το δει!" : "μάγκες θέλουν να το δουν!"
    })`,
  watchPartyThresholdReached: (userMentions, count) =>
    `🎉 ${userMentions} - **${count} ${
      count === 1 ? "μάγκας θέλει να το δει!" : "μάγκες θελουν να το δουν!"
    } **\n\n` + `Κλικ στο "Φτιάξε Ταινιοπάρτυ" για να φτιάξεις ταινιοπάρτυ!`,
  watchlistError: "❌ Έλουσα με την ενημέρωση watchlist. Πάμε πάλι.",

  // ============================================================================
  // BUTTON LABELS
  // ============================================================================
  // Used in: buildMovieButtons()
  buttonWatched: "Το έχω δει",
  buttonWantToWatch: "Θέλω να το δωω",
  buttonDelete: "Διαγραφή",
  buttonIMDB: "IMDB",
  buttonTrailer: "Trailer",
  buttonWatchParty: (count) => `Οργάνωσε ταινιοπάρτυ (${count} ενδιαφέρονται)`,
  buttonConfirmDelete: "ΝΑΙ",
  buttonCancelDelete: "Άκυρο",

  // ============================================================================
  // BULLYING MESSAGES
  // ============================================================================
  // Used in processBulliedButtonPress

  firstPressMessage: (username) =>
    `${username}, δικέ μου, συγκατάθεση ξέρεις τι σημαίνει;`,
  secondPressMessage: (username) => 
    `${username}, δες μία αν έρχομαι ρε!`,
};

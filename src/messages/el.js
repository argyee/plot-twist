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
  commandRequestDescription: "Ζήτησε ταινία στο Plex και θα σε φτιάξω.",
  commandRequestOptionTitle: "Τίτλος ταινίας για αίτημα",

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
    } **\n\n` + `Κλικ στο "Οργάνωσε Ταινιοπάρτυ" για να φτιάξεις ταινιοπάρτυ!`,
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
  buttonRequestOnPlex: "Ζήτησε στο Plex",
  buttonRequestPending: "Έχει ζητηθεί",
  buttonAvailableOnPlex: "Διαθέσιμο στο Plex",

  // ============================================================================
  // BULLYING MESSAGES
  // ============================================================================
  // Used in processBulliedButtonPress

  firstPressMessage: (username) =>
    `${username}, δικέ μου, συγκατάθεση ξέρεις τι σημαίνει;`,
  secondPressMessage: (username) =>
    `${username}, δες μία αν έρχομαι ρε!`,

  // ============================================================================
  // OVERSEERR MESSAGES
  // ============================================================================
  overseerr: {
    // Linking messages
    notLinked:
      "❌ Δεν έχεις συνδέσει τον λογαριασμό σου στο Plex! Ζήτα από έναν admin να συνδέσει τον λογαριασμό σου.",
    notLinkedUser: (username) =>
      `❌ Ο ${username} δεν είναι συνδεδεμένος με λογαριασμό στο Overseerr.`,
    alreadyLinked: (username, overseerUsername) =>
      `❌ Ο ${username} είναι ήδη συνδεδεμένος με τον λογαριασμό Overseerr: **${overseerUsername}**`,
    linkSuccess: (username, overseerUsername) =>
      `✅ Επιτυχής σύνδεση του ${username} με τον λογαριασμό Overseerr: **${overseerUsername}**`,
    linkFailed: "❌ Αποτυχία δημιουργίας σύνδεσης. Δοκίμασε ξανά.",
    unlinkSuccess: (username) =>
      `✅ Επιτυχής αποσύνδεση του ${username} από το Overseerr.`,
    unlinkFailed: "❌ Αποτυχία αφαίρεσης σύνδεσης. Δοκίμασε ξανά.",
    userNotFound: (identifier) =>
      `❌ Δεν βρέθηκε χρήστης Overseerr με αναγνωριστικό: **${identifier}**\n\nΣιγουρέψου ότι ο χρήστης έχει συνδεθεί στο Overseerr τουλάχιστον μία φορά.`,

    // Request messages
    requestSuccess: (title, is4k) =>
      `✅ Η ταινία **${title}** ζητήθηκε${is4k ? " σε 4K" : ""}! Θα ειδοποιηθείς όταν είναι διαθέσιμη.`,
    requestFailed: (error) => `❌ Αποτυχία αιτήματος: ${error}`,
    alreadyAvailable: "🟢 Αυτή η ταινία είναι ήδη διαθέσιμη στο Plex!",
    alreadyRequested:
      "🟡 Αυτή η ταινία έχει ήδη ζητηθεί. Θα προστεθεί σύντομα!",
    cancelSuccess: "✅ Το αίτημα ακυρώθηκε επιτυχώς.",
    cancelFailed: (error) => `❌ Αποτυχία ακύρωσης αιτήματος: ${error}`,

    // My requests
    noRequests:
      "Δεν έχεις ζητήσει καμία ταινία ακόμα. Κάνε κλικ στο κουμπί 'Ζήτησε στο Plex' σε οποιοδήποτε post ταινίας!",

    // Admin messages
    notConfigured:
      "❌ Το Overseerr δεν είναι ρυθμισμένο. Όρισε τα OVERSEERR_URL και OVERSEERR_API_KEY στο .env αρχείο σου.",
    connectionSuccess: (version) =>
      `✅ Επιτυχής σύνδεση με το Overseerr!\n\n**Έκδοση:** ${version}`,
    connectionFailed: (error) =>
      `❌ Αποτυχία σύνδεσης με το Overseerr:\n${error}`,
    noLinks: "Κανένας χρήστης δεν είναι συνδεδεμένος με λογαριασμό Overseerr.",
  },
};

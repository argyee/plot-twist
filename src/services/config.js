// Maps TMDB genre IDs to Discord forum tags

module.exports = {
  // TMDB Genre ID → Discord Tag Name mapping
  genreTagMapping: {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV",
    53: "Thriller",
    10752: "War",
    37: "Western",
  },

  // Number emojis for ratings
  ratingEmojis: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"],

  // Tracking emojis
  trackingEmojis: {
    watched: "✅",
    wantToWatch: "📌",
  },

  // Watch party settings
  watchParty: {
    // Minimum number of people needed to show "Organize Watch Party" button
    // Set to 1 for development/testing, 3+ for production
    threshold: process.env.NODE_ENV === "production" ? 3 : 1,

    // Placeholder event timing (in hours from when organized)
    // This gives people time to coordinate the actual date/time
    placeholderEventHours: 168, // 7 days (168 hours)

    // Event duration in hours
    eventDurationHours: 3,

    // Update button count dynamically as more people join
    dynamicCount: true,

    // Prevent multiple watch parties for the same movie
    preventDuplicates: true,

    // Track confirmed attendance via reactions
    trackConfirmedAttendees: true,
  },
};

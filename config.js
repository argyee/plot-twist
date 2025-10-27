// Maps TMDB genre IDs to Discord forum tags

module.exports = {
  // TMDB Genre ID → Discord Tag Name mapping
  genreTagMapping: {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  },

  // Default tag applied to all movies
  defaultMovieTag: 'ταινία',

  // Number emojis for ratings
  ratingEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'],
  
  // Tracking emojis
  trackingEmojis: {
    watched: '✅',
    wantToWatch: '📌'
  }
};
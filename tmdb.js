// Handles all TMDB API calls
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL;

/**
 * Search for movies by title (for autocomplete)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of movie results
 */
async function searchMovies(query) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'en-US',
        page: 1,
        include_adult: false
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error.message);
    return [];
  }
}

/**
 * Get detailed movie information by TMDB ID
 * @param {string} movieId - TMDB movie ID
 * @returns {Promise<Object>} Movie details
 */
async function getMovieDetails(movieId) {
  try {
    // Get movie details
    const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits,videos'
      }
    });

    const movie = movieResponse.data;

    // Extract cast (top 5)
    const cast = movie.credits?.cast
      ?.slice(0, 5)
      .map(actor => actor.name)
      .join(', ') || 'N/A';

    // Extract director
    const director = movie.credits?.crew
      ?.find(person => person.job === 'Director')
      ?.name || 'N/A';

    // Extract trailer (YouTube)
    const trailer = movie.videos?.results
      ?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    const trailerUrl = trailer 
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;

    // Format runtime
    const runtime = movie.runtime 
      ? `${movie.runtime} min`
      : 'N/A';

    // Get poster URL
    const posterUrl = movie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
      : null;

    return {
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0, 4) : 'N/A',
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
      plot: movie.overview || 'No plot available.',
      genres: movie.genres?.map(g => g.name).join(', ') || 'N/A',
      genreIds: movie.genres?.map(g => g.id) || [],
      cast,
      director,
      runtime,
      posterUrl,
      trailerUrl,
      tmdbUrl: `https://www.themoviedb.org/movie/${movie.id}`
    };
  } catch (error) {
    console.error('Error getting movie details:', error.message);
    return null;
  }
}

module.exports = {
  searchMovies,
  getMovieDetails
};
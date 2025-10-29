/**
 * Autocomplete Handler
 * Handles movie search autocomplete for /movie command
 */

const { AutocompleteInteraction } = require("discord.js");
const { searchMovies } = require("../services/tmdb");

/**
 * Handle autocomplete interactions for movie search
 * @param {AutocompleteInteraction} interaction - Discord autocomplete interaction
 */
async function handleAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();

  // Need at least 2 characters to search
  if (focusedValue.length < 2) {
    await interaction.respond([]);
    return;
  }

  // Search TMDB
  const results = await searchMovies(focusedValue);

  // Format results for autocomplete (max 25)
  const choices = results.slice(0, 25).map((movie) => ({
    name: `${movie.title} (${movie.release_date?.slice(0, 4) || "N/A"})`,
    value: movie.id.toString(),
  }));

  await interaction.respond(choices);
}

module.exports = handleAutocomplete;

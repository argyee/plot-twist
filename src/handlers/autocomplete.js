/**
 * Autocomplete Handler
 * Handles movie search autocomplete for /movie command
 */

const {AutocompleteInteraction} = require("discord.js");
const {searchMovies} = require("../services/tmdb");
const logger = require("../utils/logger");

/**
 * Handle autocomplete interactions for movie search
 * @param {AutocompleteInteraction} interaction - Discord autocomplete interaction
 */
async function handleAutocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    // Need at least 3 characters to search
    if (focusedValue.length < 3) {
        await interaction.respond([]);
        return;
    }

    logger.debug("Autocomplete request", {
        query: focusedValue,
        userId: interaction.user.id,
        user: interaction.user.tag,
    });

    // Search TMDB
    const results = await searchMovies(focusedValue);

    // Format results for autocomplete (max 25)
    const choices = results.slice(0, 25).map((movie) => ({
        name: `${movie.title} (${movie.release_date?.slice(0, 4) || "N/A"})`,
        value: movie.id.toString(),
    }));

    logger.debug("Autocomplete response", {
        query: focusedValue,
        resultsCount: choices.length,
        userId: interaction.user.id,
    });

    await interaction.respond(choices);
}

module.exports = handleAutocomplete;

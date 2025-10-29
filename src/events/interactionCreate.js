/**
 * Interaction Create Event Handler
 * Routes all Discord interactions to appropriate handlers
 */

const handleMovieCommand = require("../commands/movie");
const handleWatchlistCommand = require("../commands/mywatchlist");
const handleBullyCommand = require("../commands/bully");
const handleAutocomplete = require("../handlers/autocomplete");
const handleButtonInteraction = require("../handlers/buttons/index");

/**
 * Handle all interaction events
 * @param {Client} client - Discord client instance
 * @param {Interaction} interaction - Discord interaction
 */
module.exports = async (client, interaction) => {
  try {
    // Handle autocomplete interactions
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
      return;
    }

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      if (commandName === "movie") {
        await handleMovieCommand(interaction, client);
      } else if (commandName === "mywatchlist") {
        await handleWatchlistCommand(interaction);
      } else if (commandName === "bully") {
        await handleBullyCommand(interaction);
      }
      return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
      return;
    }
  } catch (error) {
    console.error("Error handling interaction:", error);

    // Try to respond with error message if possible
    if (!interaction.replied && !interaction.deferred) {
      await interaction
        .reply({
          content: "❌ An error occurred processing your request.",
          ephemeral: true,
        })
        .catch(console.error);
    }
  }
};

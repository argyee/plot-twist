/**
 * Button Interaction Router
 * Routes button clicks to appropriate handlers
 */

const { ButtonInteraction } = require("discord.js");
const handleWatchedButton = require("./watched");
const handleWatchlistButton = require("./watchlist");
const handleWatchPartyButton = require("./watchParty");
const {
  handleDeleteButton,
  handleConfirmDelete,
  handleCancelDelete,
} = require("./delete");

/**
 * Route button interactions to appropriate handler based on customId
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  try {
    if (customId.startsWith("watched_")) {
      await handleWatchedButton(interaction);
    } else if (customId.startsWith("watchlist_")) {
      await handleWatchlistButton(interaction);
    } else if (customId.startsWith("watch_party_")) {
      await handleWatchPartyButton(interaction);
    } else if (customId.startsWith("delete_")) {
      await handleDeleteButton(interaction);
    } else if (customId.startsWith("confirm_delete_")) {
      await handleConfirmDelete(interaction);
    } else if (customId.startsWith("cancel_delete_")) {
      await handleCancelDelete(interaction);
    } else {
      console.log(`Unknown button interaction: ${customId}`);
    }
  } catch (error) {
    console.error("Error handling button interaction:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ An error occurred processing your request.",
        ephemeral: true,
      });
    }
  }
}

module.exports = handleButtonInteraction;

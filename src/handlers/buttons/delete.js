/**
 * Delete Button Handlers
 * Handles delete confirmation flow for movie posts
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } = require("discord.js");
const messages = require("../../messages");
const { processBulliedButtonPress } = require("../../services/bullying");

/**
 * Handle delete button clicks
 * Shows confirmation dialog before deleting
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleDeleteButton(interaction) {
  try {
    const authorId = interaction.customId.split("_")[1];

    // Check if this user should be bullied
    const bullyMessage = processBulliedButtonPress(
      interaction.user.id,
      "delete",
      authorId,
      interaction.user.displayName
    );
    if (bullyMessage) {
      // Block the action and send bully message (public so everyone can see!)
      return await interaction.reply({
        content: bullyMessage,
      });
    }

    if (interaction.user.id !== authorId) {
      return await interaction.reply({
        content: messages.deleteOnlyAuthor,
        ephemeral: true,
      });
    }

    // Show confirmation buttons
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_delete_${interaction.user.id}`)
        .setLabel(messages.buttonConfirmDelete)
        .setEmoji("✅")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_delete_${interaction.user.id}`)
        .setLabel(messages.buttonCancelDelete)
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: messages.deleteConfirmation,
      components: [confirmRow],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling delete button:", error);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Failed to process delete request. Please try again.",
        ephemeral: true,
      });
    }
  }
}

/**
 * Handle delete confirmation button
 * Actually deletes the forum thread
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleConfirmDelete(interaction) {
  try {
    await interaction.update({
      content: "🗑️ Deleting post...",
      components: [],
    });

    const thread = interaction.channel;

    if (thread.isThread()) {
      await thread.delete();
      console.log(`Deleted thread: ${thread.name} by ${interaction.user.tag}`);
    }
  } catch (error) {
    console.error("Error deleting thread:", error);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Failed to delete post. Please try again.",
        ephemeral: true,
      });
    }
  }
}

/**
 * Handle delete cancellation button
 * Cancels the delete operation
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleCancelDelete(interaction) {
  try {
    await interaction.update({
      content: messages.deleteCancelled,
      components: [],
    });
  } catch (error) {
    console.error("Error handling cancel:", error);
  }
}

module.exports = {
  handleDeleteButton,
  handleConfirmDelete,
  handleCancelDelete,
};

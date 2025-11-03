/**
 * Delete Button Handlers
 * Handles delete confirmation flow for movie posts
 */

const {ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction} = require("discord.js");
const messages = require("../../messages");
const {processBulliedButtonPress} = require("../../services/bullying");
const logger = require("../../utils/logger");

/**
 * Handle delete button clicks
 * Shows confirmation dialog before deleting
 * @param {ButtonInteraction} interaction - Discord button interaction
 */
async function handleDeleteButton(interaction) {
    try {
        const authorId = interaction.customId.split("_")[1];

        logger.debug("Delete button pressed", {
            authorId,
            userId: interaction.user.id,
            user: interaction.user.tag,
            threadId: interaction.channel.id,
            threadName: interaction.channel.name,
        });

        // Check if this user should be bullied
        const bullyMessage = processBulliedButtonPress(
            interaction.user.id,
            "delete",
            authorId,
            interaction.user.displayName
        );
        if (bullyMessage) {
            // Block the action and send bully message (public so everyone can see!)
            logger.debug("Delete action blocked by bullying system", {
                authorId,
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
            return await interaction.reply({
                content: bullyMessage,
            });
        }

        if (interaction.user.id !== authorId) {
            logger.debug("Delete attempt by non-author", {
                authorId,
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
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
        logger.error("Error handling delete button", {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            user: interaction.user.tag,
            customId: interaction.customId,
        });

        if (!interaction.replied) {
            await interaction.reply({
                content: messages.errors.deleteProcessError,
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
        const thread = interaction.channel;

        logger.debug("Delete confirmed", {
            userId: interaction.user.id,
            user: interaction.user.tag,
            threadId: thread.id,
            threadName: thread.name,
        });

        await interaction.update({
            content: messages.errors.deletingPost,
            components: [],
        });

        if (thread.isThread()) {
            await thread.delete();
            logger.info("Thread deleted", {
                threadId: thread.id,
                threadName: thread.name,
                userId: interaction.user.id,
                user: interaction.user.tag,
            });
        }
    } catch (error) {
        logger.error("Error deleting thread", {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            user: interaction.user.tag,
            threadId: interaction.channel.id,
        });

        if (!interaction.replied) {
            await interaction.reply({
                content: messages.errors.deleteError,
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
        logger.debug("Delete cancelled", {
            userId: interaction.user.id,
            user: interaction.user.tag,
        });

        await interaction.update({
            content: messages.deleteCancelled,
            components: [],
        });
    } catch (error) {
        logger.error("Error handling cancel", {
            error: error.message,
            stack: error.stack,
            userId: interaction.user.id,
            user: interaction.user.tag,
        });
    }
}

module.exports = {
    handleDeleteButton,
    handleConfirmDelete,
    handleCancelDelete,
};

/**
 * My Requests Command Handler
 * Shows user's Overseerr requests with ability to cancel
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
} = require("discord.js");
const overseerr = require("../services/overseerr");
const {getOverseerLink} = require("../services/database");
const messages = require("../messages");

const data = new SlashCommandBuilder()
    .setName("myrequests")
    .setDescription(messages.myRequests.commandDescription);

/**
 * Handle /myrequests command
 * @param {ChatInputCommandInteraction} interaction - Discord command interaction
 */
async function execute(interaction) {
    await interaction.deferReply({ephemeral: true});

    // Check if user is linked to Overseerr
    const link = getOverseerLink(interaction.user.id);
    if (!link) {
        return await interaction.editReply({
            content: messages.overseerr.notLinked,
        });
    }

    // Get user's requests
    const requests = await overseerr.getUserRequests(link.overseerr_user_id);

    if (requests.length === 0) {
        return await interaction.editReply({
            content: messages.overseerr.noRequests,
        });
    }

    // Build embed with requests
    const embed = new EmbedBuilder()
        .setTitle(messages.myRequests.title)
        .setColor(0x01d277)
        .setTimestamp()
        .setFooter({
            text: messages.myRequests.linkedAs(
                link.overseerr_username || link.plex_username
            ),
        });

    // Group requests by status
    const pending = requests.filter((r) => r.status === 2); // PENDING
    const approved = requests.filter((r) => r.status === 3); // APPROVED
    const available = requests.filter((r) => r.status === 4); // AVAILABLE

    // Add fields for each status
    if (pending.length > 0) {
        const pendingList = pending
            .slice(0, 5)
            .map((r) => {
                const is4k = r.is4k ? " (4K)" : "";
                return `• **${r.media.tmdbId}** - ${r.media.title || "Unknown"}${is4k}`;
            })
            .join("\n");
        embed.addFields({
            name: messages.myRequests.pendingStatus(pending.length),
            value: pendingList,
            inline: false,
        });
    }

    if (approved.length > 0) {
        const approvedList = approved
            .slice(0, 5)
            .map((r) => {
                const is4k = r.is4k ? " (4K)" : "";
                return `• **${r.media.tmdbId}** - ${r.media.title || "Unknown"}${is4k}`;
            })
            .join("\n");
        embed.addFields({
            name: messages.myRequests.approvedStatus(approved.length),
            value: approvedList,
            inline: false,
        });
    }

    if (available.length > 0) {
        const availableList = available
            .slice(0, 5)
            .map((r) => {
                const is4k = r.is4k ? " (4K)" : "";
                return `• **${r.media.tmdbId}** - ${r.media.title || "Unknown"}${is4k}`;
            })
            .join("\n");
        embed.addFields({
            name: messages.myRequests.availableStatus(available.length),
            value: availableList,
            inline: false,
        });
    }

    // Add note if there are more requests
    const totalShown = Math.min(
        pending.length + approved.length + available.length,
        15
    );
    if (requests.length > totalShown) {
        embed.setDescription(
            messages.myRequests.showingCount(totalShown, requests.length)
        );
    }

    await interaction.editReply({
        embeds: [embed],
    });
}

/**
 * Handle cancel request button
 * @param {ButtonInteraction} interaction
 */
async function handleCancelRequest(interaction) {
    const requestId = interaction.customId.split("_")[2];

    await interaction.deferReply({ephemeral: true});

    const result = await overseerr.deleteRequest(requestId);

    if (result.success) {
        await interaction.editReply({
            content: messages.overseerr.cancelSuccess,
        });
    } else {
        await interaction.editReply({
            content: messages.overseerr.cancelFailed(result.error),
        });
    }
}

module.exports = {data, execute, handleCancelRequest};

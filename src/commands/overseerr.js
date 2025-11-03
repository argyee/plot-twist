/**
 * Overseerr Admin Command Handler
 * Manages Overseerr account linking and admin functions
 */

const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require("discord.js");
const overseerr = require("../services/overseerr");
const {
    linkOverseerAccount,
    unlinkOverseerAccount,
    getOverseerLink,
    getAllOverseerLinks,
} = require("../services/database");
const messages = require("../messages");
const logger = require("../utils/logger");

const data = new SlashCommandBuilder()
    .setName("overseerr")
    .setDescription(messages.overseerrCommand.description)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("link")
            .setDescription(messages.overseerrCommand.linkDescription)
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription(messages.overseerrCommand.linkUserOption)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("identifier")
                    .setDescription(messages.overseerrCommand.linkIdentifierOption)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("unlink")
            .setDescription(messages.overseerrCommand.unlinkDescription)
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription(messages.overseerrCommand.unlinkUserOption)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("status")
            .setDescription(messages.overseerrCommand.statusDescription)
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("list")
            .setDescription(messages.overseerrCommand.listDescription)
    );

/**
 * Handle /overseerr command
 * @param {ChatInputCommandInteraction} interaction - Discord command interaction
 */
async function execute(interaction) {
    await interaction.deferReply({ephemeral: true});

    const subcommand = interaction.options.getSubcommand();

    // Check if Overseerr is configured
    if (!overseerr.isConfigured() && subcommand !== "status") {
        return await interaction.editReply({
            content: messages.overseerr.notConfigured,
        });
    }

    if (subcommand === "link") {
        await handleLink(interaction);
    } else if (subcommand === "unlink") {
        await handleUnlink(interaction);
    } else if (subcommand === "status") {
        await handleStatus(interaction);
    } else if (subcommand === "list") {
        await handleList(interaction);
    }
}

/**
 * Handle linking a Discord user to Overseerr
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleLink(interaction) {
    const targetUser = interaction.options.getUser("user");
    const identifier = interaction.options.getString("identifier");

    // Find Overseerr user by identifier
    const overseerUser = await overseerr.getUserByIdentifier(identifier);

    if (!overseerUser) {
        return await interaction.editReply({
            content: messages.overseerr.userNotFound(identifier),
        });
    }

    // Check if user is already linked
    const existingLink = getOverseerLink(targetUser.id);
    if (existingLink) {
        return await interaction.editReply({
            content: messages.overseerr.alreadyLinked(
                targetUser.tag,
                existingLink.overseerr_username
            ),
        });
    }

    // Create link
    const success = linkOverseerAccount(
        targetUser.id,
        overseerUser.id.toString(),
        overseerUser.displayName,
        overseerUser.plexUsername,
        interaction.user.id
    );

    if (success) {
        await interaction.editReply({
            content: messages.overseerr.linkSuccess(
                targetUser.tag,
                overseerUser.displayName || overseerUser.plexUsername
            ),
        });

        logger.info("Linked Discord user to Overseerr", {
            discordUser: targetUser.tag,
            discordUserId: targetUser.id,
            overseerrUser: overseerUser.displayName,
            overseerrUserId: overseerUser.id,
        });
    } else {
        await interaction.editReply({
            content: messages.overseerr.linkFailed,
        });
    }
}

/**
 * Handle unlinking a Discord user from Overseerr
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleUnlink(interaction) {
    const targetUser = interaction.options.getUser("user");

    // Check if user is linked
    const link = getOverseerLink(targetUser.id);
    if (!link) {
        return await interaction.editReply({
            content: messages.overseerr.notLinkedUser(targetUser.tag),
        });
    }

    // Remove link
    const success = unlinkOverseerAccount(targetUser.id);

    if (success) {
        await interaction.editReply({
            content: messages.overseerr.unlinkSuccess(targetUser.tag),
        });

        logger.info("Unlinked Discord user from Overseerr", {
            discordUser: targetUser.tag,
            discordUserId: targetUser.id,
            overseerrUser: link.overseerr_username,
        });
    } else {
        await interaction.editReply({
            content: messages.overseerr.unlinkFailed,
        });
    }
}

/**
 * Handle checking Overseerr connection status
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleStatus(interaction) {
    if (!overseerr.isConfigured()) {
        return await interaction.editReply({
            content: messages.overseerr.notConfigured,
        });
    }

    const result = await overseerr.testConnection();

    if (result.success) {
        await interaction.editReply({
            content: messages.overseerr.connectionSuccess(result.version),
        });
    } else {
        await interaction.editReply({
            content: messages.overseerr.connectionFailed(result.error),
        });
    }
}

/**
 * Handle listing all linked accounts
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleList(interaction) {
    const links = getAllOverseerLinks();

    if (links.length === 0) {
        return await interaction.editReply({
            content: messages.overseerr.noLinks,
        });
    }

    // Build list of linked accounts
    const linkList = links
        .map((link, index) => {
            return `${index + 1}. <@${link.discord_user_id}> → **${link.overseerr_username || link.plex_username || "Unknown"}**`;
        })
        .join("\n");

    await interaction.editReply({
        content: `${messages.overseerr.linkedAccountsList(links.length)}\n\n${linkList}`,
    });
}

module.exports = {data, execute};

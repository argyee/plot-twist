/**
 * Bully Command Handler
 * Allows administrators to set/unset the bullied user
 */

const {
    PermissionFlagsBits,
    ChatInputCommandInteraction,
} = require("discord.js");
const {
    setBulliedUser,
    getBulliedUser,
    getAllCooldowns,
    resetAllCooldowns,
} = require("../services/bullying");
const messages = require("../messages");

/**
 * Handle /bully command
 * @param {ChatInputCommandInteraction} interaction - Discord command interaction
 */
async function handleBullyCommand(interaction) {
    // Check if user has Administrator permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({
            content: messages.bully.noPermission,
            ephemeral: true,
        });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
        const targetUser = interaction.options.getUser("user");
        setBulliedUser(targetUser.id);

        await interaction.reply({
            content: messages.bully.enabled(targetUser.tag, targetUser.id),
            ephemeral: true,
        });
    } else if (subcommand === "remove") {
        const currentTarget = getBulliedUser();
        if (!currentTarget) {
            return await interaction.reply({
                content: messages.bully.noBulliedUser,
                ephemeral: true,
            });
        }

        setBulliedUser(null);
        await interaction.reply({
            content: messages.bully.disabled,
            ephemeral: true,
        });
    } else if (subcommand === "status") {
        const currentTarget = getBulliedUser();
        if (!currentTarget) {
            await interaction.reply({
                content: messages.bully.statusNone,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: messages.bully.statusActive(currentTarget),
                ephemeral: true,
            });
        }
    } else if (subcommand === "cd") {
        const currentTarget = getBulliedUser();
        if (!currentTarget) {
            return await interaction.reply({
                content: messages.bully.noBulliedUser,
                ephemeral: true,
            });
        }

        const cooldown = getAllCooldowns();
        if (!cooldown) {
            await interaction.reply({
                content: messages.bully.noCooldown,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: messages.bully.cooldownStatus(
                    currentTarget,
                    cooldown.remainingMinutes
                ),
                ephemeral: true,
            });
        }
    } else if (subcommand === "cdreset") {
        const currentTarget = getBulliedUser();
        if (!currentTarget) {
            return await interaction.reply({
                content: messages.bully.noBulliedUser,
                ephemeral: true,
            });
        }

        const resetCount = resetAllCooldowns();
        if (resetCount === 0) {
            await interaction.reply({
                content: messages.bully.noCooldownToReset(currentTarget),
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: messages.bully.cooldownReset(currentTarget),
                ephemeral: true,
            });
        }
    }
}

module.exports = handleBullyCommand;

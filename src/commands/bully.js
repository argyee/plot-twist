/**
 * Bully Command Handler
 * Allows administrators to set/unset the bullied user
 */

const { PermissionFlagsBits } = require("discord.js");
const {
  setBulliedUser,
  getBulliedUser,
  getAllCooldowns,
  resetAllCooldowns,
} = require("../services/bullying");

/**
 * Handle /bully command
 * @param {Interaction} interaction - Discord command interaction
 */
async function handleBullyCommand(interaction) {
  // Check if user has Administrator permission
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return await interaction.reply({
      content: "❌ You need Administrator permission to use this command.",
      ephemeral: true,
    });
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    const targetUser = interaction.options.getUser("user");
    setBulliedUser(targetUser.id);

    await interaction.reply({
      content: `🎯 Bullying enabled for ${targetUser.tag} (${targetUser.id})\n\nThey will now need to click buttons 3 times before they work! 😈`,
      ephemeral: true,
    });
  } else if (subcommand === "remove") {
    const currentTarget = getBulliedUser();
    if (!currentTarget) {
      return await interaction.reply({
        content: "❌ No one is currently being bullied.",
        ephemeral: true,
      });
    }

    setBulliedUser(null);
    await interaction.reply({
      content: "✅ Bullying disabled. Everyone can use buttons normally now.",
      ephemeral: true,
    });
  } else if (subcommand === "status") {
    const currentTarget = getBulliedUser();
    if (!currentTarget) {
      await interaction.reply({
        content: "ℹ️ No one is currently being bullied.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `🎯 Currently bullying: <@${currentTarget}> (${currentTarget})`,
        ephemeral: true,
      });
    }
  } else if (subcommand === "cd") {
    const currentTarget = getBulliedUser();
    if (!currentTarget) {
      return await interaction.reply({
        content: "❌ No one is currently being bullied.",
        ephemeral: true,
      });
    }

    const cooldown = getAllCooldowns();
    if (!cooldown) {
      await interaction.reply({
        content: "✅ No active cooldown.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `⏱️ Universal cooldown for <@${currentTarget}>:\n\n⏰ ${cooldown.remainingMinutes} minute(s) remaining`,
        ephemeral: true,
      });
    }
  } else if (subcommand === "cdreset") {
    const currentTarget = getBulliedUser();
    if (!currentTarget) {
      return await interaction.reply({
        content: "❌ No one is currently being bullied.",
        ephemeral: true,
      });
    }

    const resetCount = resetAllCooldowns();
    if (resetCount === 0) {
      await interaction.reply({
        content: `ℹ️ No cooldown to reset for <@${currentTarget}>.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `✅ Reset cooldown for <@${currentTarget}>.\n\nThey will be bullied again on their next button click! 😈`,
        ephemeral: true,
      });
    }
  }
}

module.exports = handleBullyCommand;

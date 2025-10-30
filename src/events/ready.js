/**
 * Ready Event Handler
 * Fired when bot successfully connects to Discord
 */

const { ActivityType } = require("discord.js");
const { registerCommands } = require("../utils/commandRegistration");
const { initializeBullyingClient } = require("../services/bullying");

/**
 * Handle bot ready event
 * @param {Client} client - Discord client instance
 */
module.exports = async (client) => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  await registerCommands(client);

  // Initialize bullying service with client reference
  initializeBullyingClient(client);

  // Set initial bot presence
  client.user.setPresence({
    activities: [{ name: "Movie Nerd", type: ActivityType.Custom }],
    status: "online",
  });
};

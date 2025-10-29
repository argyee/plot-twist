/**
 * Ready Event Handler
 * Fired when bot successfully connects to Discord
 */

const { registerCommands } = require("../utils/commandRegistration");

/**
 * Handle bot ready event
 * @param {Client} client - Discord client instance
 */
module.exports = async (client) => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  await registerCommands(client);
};

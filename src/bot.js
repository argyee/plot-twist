/**
 * Discord Movie Bot - Main Entry Point
 * A Discord bot for creating and managing movie discussion forums
 */

const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

// Event handlers
const handleReady = require("./events/ready");
const handleInteractionCreate = require("./events/interactionCreate");

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Register event handlers
client.once("clientReady", () => handleReady(client));
client.on("interactionCreate", (interaction) =>
  handleInteractionCreate(client, interaction)
);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

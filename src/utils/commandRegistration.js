/**
 * Command Registration Utility
 * Registers slash commands with Discord
 */

const {REST, Routes} = require("discord.js");
const messages = require("../messages");
const overseerrCommand = require("../commands/overseerr");
const myRequestsCommand = require("../commands/myrequests");
const requestCommand = require("../commands/request");
const logger = require("./logger");

/**
 * Register slash commands with Discord
 * @param {Client} client - Discord client instance
 */
async function registerCommands(client) {
    const commands = [
        {
            name: "movie",
            description: messages.commandMovieDescription,
            options: [
                {
                    name: "title",
                    description: messages.commandMovieTitleDescription,
                    type: 3, // STRING type
                    required: true,
                    autocomplete: true,
                },
            ],
        },
        {
            name: "mywatchlist",
            description: messages.commandWatchlistDescription,
        },
        {
            name: "bully",
            description: "Manage button bullying",
            options: [
                {
                    name: "set",
                    description: "Enable bullying for a user",
                    type: 1, // SUB_COMMAND
                    options: [
                        {
                            name: "user",
                            description: "User to bully",
                            type: 6, // USER type
                            required: true,
                        },
                    ],
                },
                {
                    name: "remove",
                    description: "Disable bullying",
                    type: 1, // SUB_COMMAND
                },
                {
                    name: "status",
                    description: "Check who is currently being bullied",
                    type: 1, // SUB_COMMAND
                },
                {
                    name: "cd",
                    description: "Check active cooldowns",
                    type: 1, // SUB_COMMAND
                },
                {
                    name: "cdreset",
                    description: "Reset all cooldowns",
                    type: 1, // SUB_COMMAND
                },
            ],
        },
        // Convert command SlashCommandBuilders to JSON
        overseerrCommand.data.toJSON(),
        myRequestsCommand.data.toJSON(),
        requestCommand.data.toJSON(),
    ];

    const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN);

    try {
        logger.info("Registering slash commands...");

        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });

        logger.success("Slash commands registered successfully");
    } catch (error) {
        logger.error("Error registering commands", {error: error.message});
    }
}

module.exports = {registerCommands};

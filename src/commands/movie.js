/**
 * Movie Command Handler
 * Creates movie discussion posts in forum channel
 */

const { EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const { getMovieDetails } = require("../services/tmdb");
const { buildMovieButtons } = require("../utils/buttonBuilder");
const config = require("../services/config");
const messages = require("../messages");
const overseerr = require("../services/overseerr");

const MOVIE_FORUM_CHANNEL_ID = process.env.MOVIE_FORUM_CHANNEL_ID;

/**
 * Get Discord forum tag IDs from TMDB genre IDs
 * @param {Channel} channel - Discord forum channel
 * @param {Array<number>} genreIds - Array of TMDB genre IDs
 * @returns {Array<string>} Array of Discord tag IDs
 */
function getTagIds(channel, genreIds) {
  const availableTags = channel.availableTags;
  const tagIds = [];

  // Add genre tags (limit to Discord's 5 tag maximum)
  genreIds.forEach((genreId) => {
    // Stop if we've already reached 5 tags
    if (tagIds.length >= 5) return;

    const genreName = config.genreTagMapping[genreId];
    if (genreName) {
      const tag = availableTags.find((t) => t.name === genreName);
      if (tag) {
        tagIds.push(tag.id);
      }
    }
  });

  return tagIds;
}

/**
 * Handle /movie command
 * Creates a movie discussion post in the forum channel
 * @param {ChatInputCommandInteraction} interaction - Discord command interaction
 * @param {Client} client - Discord client instance
 */
async function handleMovieCommand(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const movieId = interaction.options.getString("title");

  try {
    // Get movie details from TMDB
    const movie = await getMovieDetails(movieId);

    if (!movie) {
      await interaction.editReply({
        content: messages.movieNotFound,
        ephemeral: true,
      });
      return;
    }

    // Get forum channel
    const forumChannel = await client.channels.fetch(MOVIE_FORUM_CHANNEL_ID);

    if (!forumChannel || !forumChannel.isThreadOnly()) {
      await interaction.editReply({
        content: messages.movieChannelNotFound,
        ephemeral: true,
      });
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(movie.title)
      .setDescription(movie.plot)
      .setColor(0x01d277) // TMDB green
      .addFields(
        { name: "📅 Release Year", value: movie.year, inline: true },
        { name: "⭐ Rating", value: `${movie.rating}/10`, inline: true },
        { name: "⏱️ Runtime", value: movie.runtime, inline: true },
        { name: "🎭 Cast", value: movie.cast },
        { name: "🎬 Director", value: movie.director, inline: true },
        { name: "🎪 Genres", value: movie.genres, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Data from TMDB" });

    // Add poster if available
    if (movie.posterUrl) {
      embed.setThumbnail(movie.posterUrl);
    }

    // Get tag IDs
    const tagIds = getTagIds(forumChannel, movie.genreIds);

    // Check Overseerr status if configured
    let overseerStatus = null;
    if (overseerr.isConfigured()) {
      overseerStatus = await overseerr.getMovieStatus(movieId);

      // Add availability info to footer if available
      if (overseerStatus.available) {
        embed.setFooter({
          text: "🟢 Available on Plex | Data from TMDB",
        });
      } else if (overseerStatus.requested || overseerStatus.processing) {
        embed.setFooter({
          text: "🟡 Request Pending | Data from TMDB",
        });
      }
    }

    // Create forum thread with action buttons
    const row = buildMovieButtons(
      movieId,
      interaction.user.id,
      movie,
      overseerStatus
    );

    const thread = await forumChannel.threads.create({
      name: `${movie.title} (${movie.year})`,
      message: {
        embeds: [embed],
        components: [row],
      },
      appliedTags: tagIds,
    });

    // Add reactions for rating and tracking
    const firstMessage = await thread.fetchStarterMessage();

    // Add rating emojis
    for (const emoji of config.ratingEmojis) {
      await firstMessage.react(emoji);
    }

    // Add tracking emojis
    await firstMessage.react(config.trackingEmojis.watched);
    await firstMessage.react(config.trackingEmojis.wantToWatch);

    // Send success message
    await interaction.editReply({
      content: messages.movieCreated(movie.title, thread.url),
      ephemeral: true,
    });

    console.log(`✅ Created movie post: ${movie.title} (${movie.year})`);
  } catch (error) {
    console.error("Error creating movie post:", error);
    await interaction.editReply({
      content: messages.movieCreationError,
      ephemeral: true,
    });
  }
}

module.exports = handleMovieCommand;

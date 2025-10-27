// Main Discord bot file
//console.log('🚀 Starting bot...');
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, AttachmentBuilder } = require('discord.js');
//console.log('✅ Discord.js imported');
const axios = require('axios');
//console.log('✅ Axios imported');
require('dotenv').config();
//console.log('✅ .env loaded');
const { searchMovies, getMovieDetails } = require('./tmdb');
const config = require('./config');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const MOVIE_FORUM_CHANNEL_ID = process.env.MOVIE_FORUM_CHANNEL_ID;

// Register slash commands with Discord
async function registerCommands() {
  const commands = [
    {
      name: 'movie',
      description: 'Create a movie discussion post',
      options: [
        {
          name: 'title',
          description: 'Movie title to search for',
          type: 3, // STRING type
          required: true,
          autocomplete: true
        }
      ]
    }
  ];

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log('Registering slash commands...');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Handle autocomplete interactions
async function handleAutocomplete(interaction) {
  const focusedValue = interaction.options.getFocused();
  
  // Need at least 2 characters to search
  if (focusedValue.length < 2) {
    await interaction.respond([]);
    return;
  }

  // Search TMDB
  const results = await searchMovies(focusedValue);
  
  // Format results for autocomplete (max 25)
  const choices = results.slice(0, 25).map(movie => ({
    name: `${movie.title} (${movie.release_date?.slice(0, 4) || 'N/A'})`,
    value: movie.id.toString()
  }));

  await interaction.respond(choices);
}

//Get Discord tag IDs from tag names
function getTagIds(channel, genreIds) {
  const availableTags = channel.availableTags;
  const tagIds = [];

  // Add default movie tag
  const defaultTag = availableTags.find(tag => tag.name === config.defaultMovieTag);
  if (defaultTag) {
    tagIds.push(defaultTag.id);
  }

  // Add genre tags
  genreIds.forEach(genreId => {
    const genreName = config.genreTagMapping[genreId];
    if (genreName) {
      const tag = availableTags.find(t => t.name === genreName);
      if (tag) {
        tagIds.push(tag.id);
      }
    }
  });

  return tagIds;
}

// Create movie forum post
async function createMoviePost(interaction, movieId) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Get movie details from TMDB
    const movie = await getMovieDetails(movieId);
    
    if (!movie) {
      await interaction.editReply({
        content: '❌ Could not fetch movie details. Please try again.',
        ephemeral: true
      });
      return;
    }

    // Get forum channel
    const forumChannel = await client.channels.fetch(MOVIE_FORUM_CHANNEL_ID);
    
    if (!forumChannel || !forumChannel.isThreadOnly()) {
      await interaction.editReply({
        content: '❌ Movie forum channel not found or is not a forum channel.',
        ephemeral: true
      });
      return;
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle(movie.title)
      .setDescription(movie.plot)
      .setColor(0x01D277) // TMDB green
      .addFields(
        { name: '📅 Release Year', value: movie.year, inline: true },
        { name: '⭐ Rating', value: `${movie.rating}/10`, inline: true },
        { name: '⏱️ Runtime', value: movie.runtime, inline: true },
        { name: '🎭 Cast', value: movie.cast },
        { name: '🎬 Director', value: movie.director, inline: true },
        { name: '🎪 Genres', value: movie.genres, inline: true },
        { name: '🔗 Links', value: `[TMDB](${movie.tmdbUrl})${movie.trailerUrl ? ` • [Trailer](${movie.trailerUrl})` : ''}` }
      )
      .setTimestamp()
      .setFooter({ text: 'Data from TMDB' });

    // Add poster if available
    if (movie.posterUrl) {
      embed.setThumbnail(movie.posterUrl);
    }

    // Get tag IDs
    const tagIds = getTagIds(forumChannel, movie.genreIds);

    // Create forum thread
    const thread = await forumChannel.threads.create({
      name: `${movie.title} (${movie.year})`,
      message: { embeds: [embed] },
      appliedTags: tagIds
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
      content: `✅ Created discussion for **${movie.title}**!\n${thread.url}`,
      ephemeral: true
    });

    console.log(`✅ Created movie post: ${movie.title} (${movie.year})`);

  } catch (error) {
    console.error('Error creating movie post:', error);
    await interaction.editReply({
      content: '❌ An error occurred while creating the movie post.',
      ephemeral: true
    });
  }
}

// Handle slash command interactions
async function handleCommand(interaction) {
  if (interaction.commandName === 'movie') {
    const movieId = interaction.options.getString('title');
    await createMoviePost(interaction, movieId);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  await registerCommands();
});

// Handle interactions (autocomplete and commands)
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    } else if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
});

// Login to Discord
client.login(DISCORD_TOKEN);
# Deployment Guide

## Pre-Deployment Checklist

- [ ] All changes tested locally
- [ ] All tests passing (`npm test`)
- [ ] Bot starts successfully (`npm start`)
- [ ] `.env` file not committed (check `.gitignore`)
- [ ] CHANGELOG.md updated
- [ ] README.md up to date

## Deployment Steps

### 1. Commit and Push Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Commit Message"

# Push to feature branch
git push origin feature/branch

# Or push directly to main (if no PR needed)
git push origin master
```

### 2. Server Deployment

#### SSH into Server

```bash
ssh user@your-server
cd /path/to/discord_moviebot
```

#### Pull Latest Changes

```bash
# Pull from your branch
git pull origin feature/branch

# Or from main
git pull origin master
```

#### Install Dependencies

```bash
# This automatically installs better-sqlite3 and all dependencies
npm install
```

#### Configure Environment Variables

**Option A: Edit .env file**

```bash
nano .env
```

Add production values:

```env
NODE_ENV=production
LANGUAGE=en
DISCORD_TOKEN=your_production_bot_token
TMDB_API_KEY=your_tmdb_api_key
MOVIE_FORUM_CHANNEL_ID=your_production_channel_id
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

**Option B: Use existing .env** (if already configured)

- No changes needed if .env already exists with correct values

#### Create data/ Directory (First Time Only)

```bash
# The data/ folder is created automatically when bot starts
# But you can create it manually if needed
mkdir -p data
```

### 3. Restart the Bot

#### If using PM2:

```bash
# First deployment
pm2 start src/bot.js --name discord-moviebot

# Subsequent deployments
pm2 restart discord-moviebot

# View logs
pm2 logs discord-moviebot

# Check status
pm2 status
```

#### If using npm directly:

```bash
# Stop existing process (Ctrl+C or kill the process)
# Then start
npm start
```

#### If using systemd service:

```bash
sudo systemctl restart discord-moviebot
sudo systemctl status discord-moviebot
```

### 4. Verify Deployment

Check that bot is running:

```bash
# PM2
pm2 status
pm2 logs discord-moviebot --lines 20

# Or check process
ps aux | grep node
```

Look for these success messages in logs:

```
✅ Bot is online as YourBot#1234
✅ Slash commands registered successfully!
📁 Using database: /path/to/data/movies.db
✅ Database tables initialized
```

Test in Discord:

- Run `/movie` command
- Try all buttons
- Check `/mywatchlist`

## Troubleshooting

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database errors

```bash
# Check data/ folder exists and is writable
ls -la data/
chmod 755 data/

# Check database path in logs
pm2 logs discord-moviebot | grep "Using database"
```

### Bot not starting

```bash
# Check environment variables
cat .env

# Check for errors
npm start
# or
pm2 logs discord-moviebot --err
```

### Commands not registering

```bash
# Commands register on bot startup
# If bot was already running, restart it
pm2 restart discord-moviebot

# Allow 10-30 seconds for Discord to sync commands
```

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous commit
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>

# Reinstall dependencies
npm install

# Restart bot
pm2 restart discord-moviebot
```

## Best Practices

1. **Always test locally first** with `NODE_ENV=development`
2. **Use PM2** for process management (auto-restart on crash)
3. **Monitor logs** regularly: `pm2 logs discord-moviebot`
4. **Backup database** before major updates:
   ```bash
   cp data/movies.db data/movies.db.backup
   ```
5. **Set up log rotation** to prevent disk space issues
6. **Use a service** like PM2 or systemd for auto-start on server reboot
# Bullying Feature Setup

## What This Does

The bullying system allows administrators to dynamically set which user will be "bullied" by the bot. When a bullied
user clicks ANY button, the bot will:

1. **1st click (any button):** Reply with a custom message (e.g., "What are you doing there, username? 🤨")
2. **2nd click (any button):** Reply with another custom message (e.g., "Still trying, username? 😏")
3. **3rd click (any button):** Actually execute the button action

After the 3rd successful click, there's a **30-minute universal cooldown** where all buttons work normally, then the
bullying resets.

## Features

- **Dynamic targeting**: Set/change the bullied user at runtime using `/bully` commands
- **Personalized messages**: Bully messages include the user's display name
- **Universal cooldown**: Single 30-minute cooldown across ALL buttons (not per-button)
- **Cooldown management**: Check active cooldown status and reset it manually
- **Admin-only**: All `/bully` commands require Administrator permission
- **Public trolling**: Bully messages are visible to everyone in the thread
- **Multi-button support**: Works on all buttons (Watched, Want to Watch, Watch Party, Delete)
- **Universal tracking**: Click count shared across all buttons and movies

## Setup Instructions

### Prerequisites

**No manual setup required!** The bullying system is fully integrated and ready to use with the `/bully` command.

### Setting Up Bullying

Use the `/bully` slash commands (requires Administrator permission):

#### Enable Bullying for a User

```
/bully set user:@username
```

This will:

- Set the target user for bullying
- Show a confirmation message (visible only to you)
- Start bullying them on their next button click

#### Check Who Is Being Bullied

```
/bully status
```

Shows which user (if any) is currently being bullied.

#### Disable Bullying

```
/bully remove
```

Stops bullying the current target. Everyone can use buttons normally.

### No Code Changes Needed

Unlike previous versions, you **don't need to edit any code files**. Everything is managed through Discord commands!

## Admin Commands

### `/bully set <user>`

Enable bullying for a specific user.

**Usage:**

```
/bully set user:@JohnDoe
```

**Response (visible only to you):**

```
🎯 Bullying enabled for JohnDoe#1234 (123456789012345678)

They will now need to click buttons 3 times before they work! 😈
```

### `/bully remove`

Disable bullying for the current target.

**Usage:**

```
/bully remove
```

**Response (visible only to you):**

```
✅ Bullying disabled. Everyone can use buttons normally now.
```

### `/bully status`

Check who is currently being bullied.

**Usage:**

```
/bully status
```

**Response (visible only to you):**

```
🎯 Currently bullying: @JohnDoe (123456789012345678)
```

Or if no one is being bullied:

```
ℹ️ No one is currently being bullied.
```

### `/bully cd`

Check active cooldown status for the bullied user (universal cooldown).

**Usage:**

```
/bully cd
```

**Response (visible only to you):**

```
⏱️ Universal cooldown for @JohnDoe:

⏰ 23 minute(s) remaining
```

Or if no cooldown:

```
✅ No active cooldown.
```

### `/bully cdreset`

Reset the cooldown for the bullied user (they will be bullied again on next click).

**Usage:**

```
/bully cdreset
```

**Response (visible only to you):**

```
✅ Reset cooldown for @JohnDoe.

They will be bullied again on their next button click! 😈
```

Or if no cooldown to reset:

```
ℹ️ No cooldown to reset for @JohnDoe.
```

## Customization

### Change the Bully Messages

Bully messages are stored in the language files and automatically include the user's display name.

**For English** - Edit `src/messages/en.js`:

```javascript
// BULLYING MESSAGES
firstPressMessage: (username) => `❌ What are you doing there, ${username}? 🤨`,
secondPressMessage: (username) => `❌ Still trying, ${username}? 😏`,
```

**For Greek** - Edit `src/messages/el.js`:

```javascript
// BULLYING MESSAGES
firstPressMessage: (username) => `${username}, συγκατάθεση ξέρεις τι σημαίνει;`,
secondPressMessage: (username) => `Μη με ακουμπάς ρε ${username}!`,
```

The `${username}` will be automatically replaced with the user's display name (without @mention).

### Change the Cooldown Time

Edit `src/services/bullying.js`:

```javascript
// Line 12 - Change cooldown duration
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// Examples:
// 5 minutes:  5 * 60 * 1000
// 10 minutes: 10 * 60 * 1000
// 1 hour:     60 * 60 * 1000
```

### Change Number of Clicks Required

Edit `src/services/bullying.js`:

```javascript
// Line ~75 - Change from 3 to any number
if (tracker.count >= 3) {
  // ← Change this number
  tracker.count = 0;
  tracker.lastReset = Date.now();
  return null;
}
```

## How It Works

### Universal Tracking

The bullying uses a **universal click counter** across ALL buttons:

- 1st click on "Want to Watch" for Movie A → First message
- 2nd click on "Watched" for Movie B → Second message
- 3rd click on "Watch Party" for Movie C → Action executes, cooldown starts

The click count is shared across all buttons and all movies!

### Universal Cooldown

After the 3rd successful click, a 30-minute universal cooldown begins. During cooldown:

- **ALL buttons work normally** (no bullying on any button)
- After 30 minutes, the cooldown expires and bullying starts fresh
- The click counter resets to 0

### Memory Storage

Bullying data is stored **in-memory** (RAM):

- ✅ Fast and simple
- ✅ No database needed
- ❌ Resets when bot restarts
- ❌ Not shared across multiple bot instances

If you want persistent tracking (survives bot restarts), you'd need to store it in the database instead.

## Testing

1. Use `/bully set` to target yourself or a test user
2. Try clicking a button 3 times on a movie
3. Watch the bully messages appear!
4. Test cooldown management with `/bully cd` and `/bully cdreset`
5. Everyone in the thread can see the public bully messages 😄

## Disabling Bullying

To temporarily disable bullying, use the `/bully remove` command:

```
/bully remove
```

This will allow everyone to use buttons normally until you set a new target with `/bully set`.

## Example Flow

**Admin sets up bullying:**

```
Admin: /bully set user:@JohnDoe
Bot (private): 🎯 Bullying enabled for JohnDoe#1234
```

**JohnDoe interacts with buttons:**

```
Click 1 - "Want to Watch" on Movie A:
    🤖 Bot replies (PUBLIC): ❌ What are you doing there, JohnDoe? 🤨
       (Everyone in the thread can see this! 😂)
       (Nothing happens, button doesn't work)

Click 2 - "Watched" on Movie B:
    🤖 Bot replies (PUBLIC): ❌ Still trying, JohnDoe? 😏
       (Different movie, different button - but count continues!)
       (Still nothing happens, everyone watches the roast)

Click 3 - "Watch Party" on Movie C:
    ✅ Watch party created!
       (Third click works! Universal cooldown starts across ALL buttons)

[Within 30 minutes - JohnDoe tries ANY button...]

Click 4 - "Watched" on Movie D:
    ✅ Marked as watched!
       (Works normally - universal cooldown is active)

Click 5 - "Want to Watch" on Movie E:
    ✅ Added to watchlist!
       (ALL buttons work normally during cooldown)

[30 minutes pass... cooldown expires]

Click 6 - ANY button:
    🤖 Bot replies (PUBLIC): ❌ What are you doing there, JohnDoe? 🤨
       (Bullying resets and starts again! 😈)
```

**Admin checks cooldown status:**

```
Admin: /bully cd
Bot (private): ⏱️ Universal cooldown for @JohnDoe:

               ⏰ 15 minute(s) remaining
```

**Admin resets cooldown:**

```
Admin: /bully cdreset
Bot (private): ✅ Reset cooldown for @JohnDoe.

               They will be bullied again on their next button click! 😈
```

## Important Notes

- 📢 **Bully messages are PUBLIC** - Everyone in the thread can see them!
- 🎯 **Only one user can be bullied at a time** - Setting a new target replaces the previous one
- 👑 **Admin-only** - All `/bully` commands require Administrator permission
- ⏱️ **Universal 30-minute cooldown** - After 3rd click, ALL buttons work normally for 30 minutes
- 🔁 **Universal tracking** - Click count is shared across ALL buttons and ALL movies
- 💭 **Personalized messages** - Bully messages include the user's display name
- 🔄 **In-memory storage** - Cooldown data resets when the bot restarts
- 🌍 **Multi-language** - Bully messages use the configured language (LANGUAGE in .env)

## Quick Command Reference

| Command             | Description                | Who Can Use |
|---------------------|----------------------------|-------------|
| `/bully set <user>` | Enable bullying for a user | Admins only |
| `/bully remove`     | Disable bullying           | Admins only |
| `/bully status`     | Check who is being bullied | Admins only |
| `/bully cd`         | Check active cooldowns     | Admins only |
| `/bully cdreset`    | Reset all cooldowns        | Admins only |
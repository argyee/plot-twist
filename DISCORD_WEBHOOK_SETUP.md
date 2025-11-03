# Discord Webhook Setup for GitHub Actions

This guide shows you how to set up Discord notifications for CI/CD pipeline events.

## Step 1: Create a Discord Webhook

1. **Open Discord** and go to the channel where you want to receive notifications
    - Recommended: Create a dedicated `#github-actions` or `#deployments` channel

2. **Edit Channel** → **Integrations** → **Webhooks** → **New Webhook**

3. **Configure the Webhook:**
    - Name: `GitHub Actions` (or whatever you prefer)
    - Channel: Select your notifications channel
    - Copy the **Webhook URL** (looks like: `https://discord.com/api/webhooks/...`)

4. **Click "Save"**

## Step 2: Add Webhook to GitHub Secrets

1. **Go to your GitHub repository**

2. **Navigate to:** Settings → Secrets and variables → Actions

3. **Click "New repository secret"**

4. **Add the secret:**
    - Name: `DISCORD_WEBHOOK`
    - Secret: Paste the webhook URL from Step 1
    - Click "Add secret"

## Step 3: (Optional) Add Codecov Token for Coverage Reports

If you want test coverage reports:

1. **Go to [codecov.io](https://codecov.io)** and sign in with GitHub

2. **Add your repository** to Codecov

3. **Copy the upload token**

4. **Add to GitHub secrets:**
    - Name: `CODECOV_TOKEN`
    - Secret: Paste the Codecov token
    - Click "Add secret"

## What You'll Receive

Once configured, you'll get Discord notifications for:

### ✅ Test Success

```
✅ Tests Passed
All tests passed successfully on `master`
```

### ❌ Test Failure

```
❌ Tests Failed
Tests failed on `master`
[View Run](link to GitHub Actions)
```

### 🚀 Deployment Started

```
🚀 Deployment Started
Deploying to production server...
```

### ✅ Deployment Success

```
✅ Deployment Successful
Successfully deployed to production!

Commit: `Fix movie search bug`
Author: Your Name
Branch: `master`
```

### ❌ Deployment Failure

```
❌ Deployment Failed
Deployment to production failed!

Commit: `Update feature`
Branch: `master`
[View Run](link to GitHub Actions)
```

## Notification Colors

- 🟢 **Green** (Success): `#00ff00`
- 🔴 **Red** (Failure): `#ff0000`
- 🟠 **Orange** (In Progress): `#ffaa00`

## Testing the Setup

After setting up:

1. Push a small change to `master` (like updating CHANGELOG.md)
2. Watch your Discord channel for notifications
3. If nothing appears, check:
    - Webhook URL is correct in GitHub Secrets
    - Discord channel permissions allow webhook posts
    - GitHub Actions workflow is running (check Actions tab)

## Troubleshooting

**No notifications appearing?**

- Check GitHub Actions logs for webhook errors
- Verify the secret name is exactly `DISCORD_WEBHOOK`
- Make sure the webhook URL includes the full path with token

**Notifications too noisy?**

- Create a dedicated channel (e.g., `#ci-cd-logs`)
- Adjust notification settings for that channel
- Consider muting the channel and only checking when needed

## Customization

You can customize the notifications by editing `.github/workflows/ci-cd.yml`:

```yaml
- name: Send Discord notification
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: "Your Custom Title"
    description: "Your custom message"
    color: 0x0000ff  # Custom color (hex)
```

## Security Note

⚠️ **Never commit webhook URLs to your repository!**
Always store them in GitHub Secrets.

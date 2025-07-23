# GitHub Setup Guide

## Getting Your Project on GitHub

Follow these steps to upload your Audio Translator app to GitHub:

### 1. Initialize Git Repository

Open PowerShell/Command Prompt in your project folder and run:

```bash
cd "c:\Codeexp\translatorapp-new"
git init
```

### 2. Add Files to Repository

```bash
git add .
git commit -m "Initial commit: Audio Translator app with Azure AI"
```

### 3. Create Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `audio-translator-app` (or your preferred name)
   - **Description**: `AI-powered audio translation app using Azure Cognitive Services`
   - **Visibility**: Choose Public or Private
   - **Don't** initialize with README (we already have one)
5. Click "Create repository"

### 4. Connect Local Repository to GitHub

Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual values:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### 5. Security Setup Complete! 🔒

Your repository is now safe because:

- ✅ Your Azure API keys are **NOT** included (they're replaced with placeholders)
- ✅ `.gitignore` prevents accidental key commits
- ✅ `script.js.backup` contains your working keys (local only)

### 6. To Work with Your Keys Locally

When you want to use the app with your real Azure keys:

```bash
# Restore your working version
copy script.js.backup script.js
```

When you want to commit changes to GitHub:

```bash
# Use the template version (without keys)
copy script.template.js script.js
git add .
git commit -m "Your commit message"
git push
```

### 7. Deployment Options

Once on GitHub, you can deploy to:

- **Azure Static Web Apps**: Connect your GitHub repo directly
- **Netlify**: Connect your GitHub repo for automatic deployments
- **GitHub Pages**: Enable in your repository settings
- **Vercel**: Connect your GitHub repo for instant deployments

### 8. Collaborating Safely

If others want to use your app:

1. They clone your repository
2. They get their own Azure keys
3. They copy `script.template.js` to `script.js`
4. They add their keys to the new `script.js`
5. They never commit their keys

### Important Notes

- **Never commit the `script.js.backup` file** - it contains your real keys
- Always check what you're committing: `git diff --cached`
- The `.gitignore` file helps protect against accidents
- Your working app will always be in demo mode after pulling from GitHub

### Quick Commands Reference

```bash
# Check status
git status

# See what changed
git diff

# Stage specific files
git add filename.html

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull
```

## Troubleshooting

**Problem**: Git commands not recognized
**Solution**: Install Git from https://git-scm.com/

**Problem**: Authentication issues with GitHub
**Solution**: Use GitHub Desktop or set up SSH keys

**Problem**: Accidentally committed keys
**Solution**: 
1. Remove them from the files
2. Commit the fix
3. Consider rotating your Azure keys for security

Happy coding! 🚀

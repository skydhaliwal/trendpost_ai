# TrendPost AI

A LinkedIn thought leadership post generator for senior engineering leaders.

## Description

TrendPost AI helps engineering leaders create compelling LinkedIn posts by generating drafts based on trending topics, chosen styles, tones, and personal perspectives using Google's Gemini API.

## Features

- Curated trending topics across 6 categories: AI Agents, Platform Engineering, Developer Productivity, FinOps, Governance, Engineering Leadership
- Post styles: 3 Lessons, Hot Take, Trend + Implication, Framework, Story, Community Q
- Tones: Strategic, Technical, Conversational
- Optional personal perspective
- Generates 2 draft posts
- Edit drafts in-app
- Copy to clipboard or save to local library
- View, copy, or delete saved drafts

## Tech Stack

- Single-file HTML app
- Vanilla JavaScript
- CSS in style tag
- Google Gemini 2.0 Flash API
- Lucide Icons from CDN
- Google Fonts (Inter)

## Configuration

### API Key Setup

The app uses a Google Gemini API key stored in `config.js`. The API key is configured at the file level and is not exposed in the UI.

**⚠️ Security Warning**: Since this is a client-side only application, API keys are visible to users in the browser's network requests. This setup is suitable for development/demo purposes but not recommended for production use.

**For Production**: Implement a backend server to proxy API calls and keep API keys secure.

### Files:
- `config.js` - Contains API configuration (edit this file to update your API key)
- `.env` - Example environment file (for documentation only, not used by client-side app)
- `.gitignore` - Prevents committing sensitive config files

To update the API key:
- Edit `config.js` and update the `GEMINI_API_KEY` value

## How to Use

1. Open `linkedin-post-generator.html` in a web browser.
2. Enter a topic or choose from suggestions.
3. Select post style and tone.
4. Optionally add your perspective.
5. Click "Generate Drafts" to create posts.
6. Edit drafts, copy, or save them.
7. View saved drafts in the Saved Drafts section.

## API Key

The app uses a Google Gemini API key included in the code. For production, consider securing the API key.

## Target Audience

Engineering leaders, CTOs, VPs of Engineering, and AI transformation stakeholders.

## Deployment (Firebase Hosting — Google Cloud)

### One-time setup (run these commands in VS Code terminal):

Step 1 — Install Firebase CLI:

npm install -g firebase-tools

Step 2 — Login with your Google account:

firebase login

Step 3 — Initialise Firebase in the project:

firebase init hosting

When prompted:
- Use an existing project or create new → create new, name it trendpost-ai
- Public directory → . (just a dot for root)
- Single page app → N
- Automatic GitHub deploys → Y
- GitHub repo → your-username/trendpost-ai
- Automatic deploys on main → Y
- Preview deployments on PRs → Y

Step 4 — First manual deploy:

firebase deploy

### After setup — every future deploy is automatic:

git add .
git commit -m "your message"
git push origin main
→ GitHub Actions deploys to Firebase within 2 minutes
→ Live at https://trendpost-ai-xxxxx.web.app

### Cost: $0 forever (Firebase Hosting free tier)
- 10GB storage
- 360MB bandwidth per day  
- Custom domain and SSL included
- Global CDN included
# TrendPost AI

A LinkedIn thought leadership post generator for senior engineering leaders — powered by Google Gemini.

## Features

- Curated trending topics across 6 categories: AI Agents, Platform Engineering, Developer Productivity, FinOps, Governance, Engineering Leadership
- Post styles: 3 Lessons, Hot Take, Trend + Implication, Framework, Story, Community Q
- Tones: Strategic, Technical, Conversational
- Optional personal context and call-to-action
- Generates 2 unique draft posts per request
- Live character counter (LinkedIn 3,000 char limit)
- Edit drafts in-app, copy to clipboard, or save to an in-session library
- Light / dark mode toggle

## Tech Stack

| Layer | Technology |
|---|---|
| App | Single-page HTML + Vanilla JS (ES modules) |
| AI | Google Gemini API (`gemini-flash-latest`) |
| Hosting | Firebase Hosting |
| Icons | Lucide (CDN) |
| Fonts | Google Fonts — Inter |

## Getting Started

### 1. Get a Gemini API Key

Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Run Locally

No build step required. Serve the project root with any static file server:

```bash
npx serve . -p 3000
# then open http://localhost:3000/linkedin-post-generator.html
```

### 3. Use the App

1. Enter your Gemini API key in the API key field
2. Enter a topic or pick from curated suggestions
3. Select a post style and tone
4. Optionally add personal context or a call-to-action
5. Click **Generate Posts**
6. Edit, copy, or save the drafts

> Your API key is used directly in the browser and never stored or sent anywhere other than the Gemini API.

## Project Structure

```
├── linkedin-post-generator.html   # Main app entry point
├── src/
│   ├── app.js                     # DOM logic and event handlers
│   └── utils.js                   # Pure functions (prompt building, parsing, clipboard)
├── tests/
│   ├── setup.js                   # jsdom test setup and shared DOM fixture
│   ├── unit/
│   │   └── utils.test.js          # Unit tests for pure utility functions
│   ├── component/
│   │   └── dom.test.js            # Component tests for DOM interactions
│   └── e2e/
│       └── app.spec.js            # End-to-end Playwright tests (mocked Gemini API)
├── .github/workflows/
│   ├── tests.yml                  # CI: run tests on every push and PR
│   ├── firebase-hosting-merge.yml # Deploy to live on merge to main
│   ├── firebase-hosting-pull-request.yml  # Preview deploy on PR
│   └── auto-pr.yml                # Auto-create PR to main on push
├── vitest.config.js               # Vitest configuration
├── playwright.config.js           # Playwright configuration
└── package.json                   # Dev dependencies and scripts
```

## Testing

### Install dependencies

```bash
npm install
```

### Unit & Component tests (Vitest + jsdom)

```bash
npm test
```

Covers 55 tests across:
- `copyToClipboard`, `buildUserPrompt`, `buildSystemPrompt`, `parseDraftsResponse`, `getCharCountStatus`
- `switchView`, `showToast`, `updateCharCounter`, `displayDrafts`, `saveDraft`, `deleteDraft`, `showErrorMessage`

### End-to-end tests (Playwright)

```bash
npx playwright install --with-deps chromium   # first time only
npm run test:e2e
```

Covers 12 full browser tests using a **mocked Gemini API response** — no real API key or quota needed:
- Page load, navigation, theme toggle
- Validation errors (missing topic, missing API key)
- Draft generation, character counter, copy button, save draft

### Run all tests

```bash
npm run test:all
```

## CI / CD

| Trigger | Workflow | Action |
|---|---|---|
| Push to any branch (except main) | `auto-pr.yml` | Opens a PR to main automatically |
| PR to main opened/updated | `firebase-hosting-pull-request.yml` | Deploys a preview channel |
| Merge to main | `firebase-hosting-merge.yml` | Deploys to live Firebase Hosting |
| Push or PR | `tests.yml` | Runs unit, component and E2E tests |

## Deployment (Firebase Hosting)

### One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

When prompted:
- Public directory → `.` (project root)
- Single page app → N
- GitHub Actions deploy → Y

### Manual deploy

```bash
firebase deploy
```

### Automatic deploy

Every merge to `main` triggers `firebase-hosting-merge.yml` and deploys automatically.

**Cost: $0** — Firebase Hosting free tier includes 10 GB storage, 360 MB/day bandwidth, global CDN and SSL.

## Target Audience

Engineering leaders, CTOs, VPs of Engineering, and AI transformation stakeholders who want to build a consistent LinkedIn presence with minimal effort.

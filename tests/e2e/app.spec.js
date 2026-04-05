import { test, expect } from '@playwright/test';

const MOCK_DRAFTS = [
    {
        label: 'Draft 1',
        angle: 'AI is reshaping engineering teams faster than we think',
        post: 'Three years ago, I thought AI would assist developers. I was wrong.\n\nAI is now making architectural decisions, writing production code, and catching bugs before humans review them.\n\nHere\'s what that means for engineering leaders:\n\n1. Your team\'s value is shifting from writing code to reviewing and directing AI output.\n2. The engineers who thrive will be those who can prompt, evaluate, and iterate on AI-generated solutions.\n3. Headcount planning needs to account for 10x productivity gains — or be left behind.\n\nThe question isn\'t whether to adopt AI in engineering. It\'s whether you\'re building the culture to leverage it.\n\nWhat\'s your team\'s AI adoption strategy for 2025?\n\n#AIEngineering #EngineeringLeadership #FutureOfWork #TechStrategy'
    },
    {
        label: 'Draft 2',
        angle: 'The hidden cost of ignoring AI in your engineering org',
        post: 'Most engineering leaders are underestimating AI adoption risk — but not how you\'d expect.\n\nThe risk isn\'t moving too fast. It\'s moving too slow.\n\nCompanies that delayed cloud adoption in 2015 spent 3x more catching up by 2020. The same pattern is playing out with AI today.\n\nThree signals your org is falling behind:\n\n1. Engineers still manually write boilerplate code that AI handles in seconds.\n2. Code review cycles haven\'t shortened despite AI-assisted development tools.\n3. Your AI strategy is a slide deck, not a shipped product.\n\nThe compounding advantage of early AI adoption is real. Every quarter you wait is market share your competitors are capturing.\n\nWhat\'s stopping your org from going all-in on AI-assisted development?\n\n#AIStrategy #EngineeringExcellence #TechLeadership #Innovation'
    }
];

const MOCK_GEMINI_RESPONSE = {
    candidates: [{
        content: {
            parts: [{ text: JSON.stringify(MOCK_DRAFTS) }]
        }
    }]
};

test.beforeEach(async ({ page }) => {
    // Intercept all Gemini API calls and return mock response
    await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_GEMINI_RESPONSE)
        });
    });
});

test('page loads with correct title', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await expect(page).toHaveTitle(/TrendPost AI/);
});

test('generate button is present', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await expect(page.locator('#generate-btn')).toBeVisible();
});

test('API key input is present', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await expect(page.locator('#api-key')).toBeVisible();
});

test('shows error when topic is empty', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });
    await page.click('#generate-btn');
    await expect(page.locator('#drafts')).toContainText('Please enter a topic');
});

test('shows error when API key is empty', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });
    await page.click('#generate-btn');
    await expect(page.locator('#drafts')).toContainText('Gemini API key');
});

test('generates two draft posts with mocked API', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });

    await page.click('#generate-btn');

    await expect(page.locator('.draft-card')).toHaveCount(2);
    await expect(page.locator('.draft-title').first()).toContainText('Draft A');
    await expect(page.locator('.draft-title').last()).toContainText('Draft B');
});

test('draft content is populated from mock response', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });

    await page.click('#generate-btn');
    await page.waitForSelector('.draft-text');

    const firstDraftText = await page.locator('.draft-text').first().inputValue();
    expect(firstDraftText).toContain('#AIEngineering');
});

test('character counter is visible after generation', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });

    await page.click('#generate-btn');
    await page.waitForSelector('.char-count');

    await expect(page.locator('.char-count').first()).toContainText('/ 3,000 characters');
});

test('copy to clipboard button is visible on each draft', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });

    await page.click('#generate-btn');
    await page.waitForSelector('.btn-copy');

    await expect(page.locator('.btn-copy')).toHaveCount(2);
});

test('save draft button saves and shows in saved view', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');
    await page.fill('#topic', 'AI in engineering');
    await page.fill('#api-key', 'AIzaFakeKeyForTesting');
    await page.selectOption('#post-style', { index: 1 });
    await page.selectOption('#tone', { index: 1 });

    await page.click('#generate-btn');
    await page.waitForSelector('.btn-save');
    await page.locator('.btn-save').first().click();

    await page.click('#nav-saved');
    await expect(page.locator('.saved-draft')).toHaveCount(1);
});

test('navigation switches between generate and saved views', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');

    await page.click('#nav-saved');
    await expect(page.locator('#saved-view')).toHaveClass(/active/);
    await expect(page.locator('#generate-view')).not.toHaveClass(/active/);

    await page.click('#nav-generate');
    await expect(page.locator('#generate-view')).toHaveClass(/active/);
    await expect(page.locator('#saved-view')).not.toHaveClass(/active/);
});

test('theme toggle switches between light and dark mode', async ({ page }) => {
    await page.goto('/linkedin-post-generator.html');

    await expect(page.locator('body')).toHaveClass(/light-mode/);
    await page.click('#theme-btn');
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    await page.click('#theme-btn');
    await expect(page.locator('body')).not.toHaveClass(/dark-mode/);
});

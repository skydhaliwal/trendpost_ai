import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    copyToClipboard,
    buildSystemPrompt,
    buildUserPrompt,
    parseDraftsResponse,
    getCharCountStatus,
    GEMINI_URL,
    trendingTopics
} from '../../src/utils.js';

describe('GEMINI_URL', () => {
    it('points to gemini-flash-latest model', () => {
        expect(GEMINI_URL).toContain('gemini-flash-latest');
        expect(GEMINI_URL).toContain('generateContent');
    });
});

describe('trendingTopics', () => {
    it('has expected top-level categories', () => {
        expect(Object.keys(trendingTopics)).toContain('AI Agents');
        expect(Object.keys(trendingTopics)).toContain('Engineering Leadership');
    });

    it('each category has at least one topic', () => {
        for (const category of Object.values(trendingTopics)) {
            expect(category.length).toBeGreaterThan(0);
        }
    });
});

describe('copyToClipboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses navigator.clipboard when available in secure context', async () => {
        await copyToClipboard('hello world');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
    });

    it('calls clipboard with the exact text provided', async () => {
        const text = 'Test post #AI #Leadership';
        await copyToClipboard(text);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('falls back to execCommand when not in secure context', async () => {
        Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
        await copyToClipboard('fallback text');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
        Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    });
});

describe('buildSystemPrompt', () => {
    it('returns a non-empty string', () => {
        const prompt = buildSystemPrompt();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
    });

    it('mentions key audience (CTOs, VPs)', () => {
        const prompt = buildSystemPrompt();
        expect(prompt).toContain('CTOs');
        expect(prompt).toContain('VPs of Engineering');
    });

    it('includes character count guidance', () => {
        const prompt = buildSystemPrompt();
        expect(prompt).toContain('900-1400 characters');
    });

    it('includes hashtag requirement', () => {
        const prompt = buildSystemPrompt();
        expect(prompt).toContain('hashtags');
    });
});

describe('buildUserPrompt', () => {
    it('includes topic, style and tone', () => {
        const prompt = buildUserPrompt('AI Agents', 'storytelling', 'professional', '', 'none');
        expect(prompt).toContain('AI Agents');
        expect(prompt).toContain('storytelling');
        expect(prompt).toContain('professional');
    });

    it('includes perspective when provided', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', 'My team uses GPT-4', 'none');
        expect(prompt).toContain('My team uses GPT-4');
    });

    it('does not include context section when perspective is empty', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'none');
        expect(prompt).not.toContain('Context from user');
    });

    it('appends question CTA instruction', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'question');
        expect(prompt).toContain('thought-provoking question');
    });

    it('appends opinion CTA instruction', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'opinion');
        expect(prompt).toContain("audience's perspectives");
    });

    it('appends sharing CTA instruction', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'sharing');
        expect(prompt).toContain('share their experiences');
    });

    it('does not append CTA for none', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'none');
        expect(prompt).not.toContain('Callout');
    });

    it('includes JSON format instructions', () => {
        const prompt = buildUserPrompt('AI', 'list', 'bold', '', 'none');
        expect(prompt).toContain('JSON array');
        expect(prompt).toContain('"label"');
        expect(prompt).toContain('"angle"');
        expect(prompt).toContain('"post"');
    });
});

describe('parseDraftsResponse', () => {
    const validResponse = JSON.stringify([
        { label: 'Draft 1', angle: 'Angle A', post: 'Post content A #AI' },
        { label: 'Draft 2', angle: 'Angle B', post: 'Post content B #Tech' }
    ]);

    it('parses valid JSON with 2 drafts', () => {
        const drafts = parseDraftsResponse(validResponse);
        expect(drafts).toHaveLength(2);
        expect(drafts[0].label).toBe('Draft 1');
        expect(drafts[1].label).toBe('Draft 2');
    });

    it('throws on invalid JSON', () => {
        expect(() => parseDraftsResponse('not json')).toThrow();
    });

    it('throws when response is not an array', () => {
        expect(() => parseDraftsResponse(JSON.stringify({ label: 'Draft 1' }))).toThrow('Invalid response format');
    });

    it('throws when array has wrong length', () => {
        expect(() => parseDraftsResponse(JSON.stringify([{ label: 'Draft 1' }]))).toThrow('Invalid response format');
    });

    it('throws when array has too many items', () => {
        const three = [
            { label: 'Draft 1' }, { label: 'Draft 2' }, { label: 'Draft 3' }
        ];
        expect(() => parseDraftsResponse(JSON.stringify(three))).toThrow('Invalid response format');
    });
});

describe('getCharCountStatus', () => {
    it('returns false for both when under 2700', () => {
        const { isNearLimit, isOverLimit } = getCharCountStatus(1000);
        expect(isNearLimit).toBe(false);
        expect(isOverLimit).toBe(false);
    });

    it('marks near limit when between 2701 and 3000', () => {
        const { isNearLimit, isOverLimit } = getCharCountStatus(2800);
        expect(isNearLimit).toBe(true);
        expect(isOverLimit).toBe(false);
    });

    it('marks over limit when above 3000', () => {
        const { isNearLimit, isOverLimit } = getCharCountStatus(3100);
        expect(isNearLimit).toBe(true);
        expect(isOverLimit).toBe(true);
    });

    it('is not near limit at exactly 2700', () => {
        expect(getCharCountStatus(2700).isNearLimit).toBe(false);
    });

    it('is near limit at exactly 2701', () => {
        expect(getCharCountStatus(2701).isNearLimit).toBe(true);
    });

    it('is not over limit at exactly 3000', () => {
        expect(getCharCountStatus(3000).isOverLimit).toBe(false);
    });

    it('is over limit at exactly 3001', () => {
        expect(getCharCountStatus(3001).isOverLimit).toBe(true);
    });
});

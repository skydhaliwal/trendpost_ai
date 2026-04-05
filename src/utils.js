export const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const trendingTopics = {
    'AI Agents': ['Autonomous AI systems', 'Multi-agent collaboration', 'AI agent frameworks', 'Ethical AI deployment'],
    'Platform Engineering': ['Internal developer platforms', 'Platform as a product', 'DevOps evolution', 'Cloud-native architectures'],
    'Developer Productivity': ['AI-powered coding tools', 'Low-code platforms', 'Continuous integration best practices', 'Developer experience metrics'],
    'FinOps': ['Cloud cost optimization', 'FinOps culture', 'Budget forecasting tools', 'Resource utilization analytics'],
    'Governance': ['Compliance automation', 'Risk management frameworks', 'Data governance policies', 'Security by design'],
    'Engineering Leadership': ['Scaling engineering teams', 'Technical debt management', 'Innovation in engineering', 'Leadership in AI transformation']
};

export function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy') ? resolve() : reject();
        } catch (e) {
            reject(e);
        } finally {
            document.body.removeChild(textarea);
        }
    });
}

export function buildSystemPrompt() {
    return `You are an expert AI transformation strategist and senior engineering leader. You write LinkedIn posts for C-suite and senior engineering leaders (CTOs, VPs of Engineering, principal engineers). Your posts are:
- Specific and practical (no generic motivational content)
- Executive-friendly with clear business impact
- Based on real industry trends and deep technical insights
- Written from a first-person perspective as a thought leader
- Designed to demonstrate expertise and drive engagement

Posts must be 900-1400 characters, with:
1. A strong opening hook that demands attention
2. Exactly 3 insight points (each 1-2 sentences)
3. A clear takeaway or call-to-action
4. 3-4 relevant hashtags at the end`;
}

export function buildUserPrompt(topic, style, tone, perspective, cta) {
    let prompt = `Create 2 unique LinkedIn post drafts about: "${topic}"\n\nStyle: ${style}\nTone: ${tone}`;

    if (perspective && perspective.trim()) {
        prompt += `\nContext from user: ${perspective}`;
    }

    if (cta && cta !== 'none') {
        const ctaInstructions = {
            'question': 'End with a thought-provoking question.',
            'opinion': "End by asking for the audience's perspectives.",
            'sharing': 'End by encouraging the audience to share their experiences.'
        };
        if (ctaInstructions[cta]) {
            prompt += `\nCallout: ${ctaInstructions[cta]}`;
        }
    }

    prompt += `\n\nIMPORTANT: Return your response as a JSON array with exactly 2 objects. Each object must have:\n{\n  "label": "Draft 1" or "Draft 2",\n  "angle": "One-line description of this draft's unique angle",\n  "post": "The full LinkedIn post text (900-1400 characters, with 3-4 hashtags at the end)"\n}\n\nReturn ONLY the JSON array, no other text.`;

    return prompt;
}

export function parseDraftsResponse(text) {
    const drafts = JSON.parse(text);
    if (!Array.isArray(drafts) || drafts.length !== 2) {
        throw new Error('Invalid response format');
    }
    return drafts;
}

export function getCharCountStatus(charCount) {
    return {
        isNearLimit: charCount > 2700,
        isOverLimit: charCount > 3000
    };
}

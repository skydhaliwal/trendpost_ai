import { vi } from 'vitest';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('')
    },
    writable: true,
    configurable: true
});

Object.defineProperty(window, 'isSecureContext', {
    value: true,
    writable: true,
    configurable: true
});

// Mock document.execCommand for clipboard fallback tests
document.execCommand = vi.fn().mockReturnValue(true);

// Minimal DOM structure used by DOM-dependent functions
export function setupDOM() {
    document.body.innerHTML = `
        <div id="toast-container"></div>
        <nav>
            <a id="nav-generate" href="#" class="active">Generate</a>
            <a id="nav-saved" href="#">Saved</a>
        </nav>
        <button id="theme-btn">🌙</button>
        <div id="generate-view" class="active"></div>
        <div id="saved-view"></div>
        <div id="drafts-section" style="display:none">
            <div id="drafts"></div>
        </div>
        <div id="saved-drafts"></div>
        <input id="topic" type="text" />
        <select id="post-style"><option value="storytelling">Storytelling</option></select>
        <select id="tone"><option value="professional">Professional</option></select>
        <textarea id="perspective"></textarea>
        <select id="cta"><option value="none">None</option><option value="question">Question</option></select>
        <input id="api-key" type="password" />
        <button id="generate-btn">Generate Posts</button>
        <div id="suggestions" style="display:none"></div>
        <button id="show-suggestions">Suggest</button>
    `;
}

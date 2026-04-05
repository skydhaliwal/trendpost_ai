import {
    GEMINI_URL,
    trendingTopics,
    copyToClipboard,
    buildSystemPrompt,
    buildUserPrompt,
    parseDraftsResponse,
    getCharCountStatus
} from './utils.js';

export const state = { savedDrafts: [] };

export function switchView(view) {
    const generateView = document.getElementById('generate-view');
    const savedView = document.getElementById('saved-view');
    const navGenerate = document.getElementById('nav-generate');
    const navSaved = document.getElementById('nav-saved');

    if (view === 'generate') {
        generateView.classList.add('active');
        savedView.classList.remove('active');
        navGenerate.classList.add('active');
        navSaved.classList.remove('active');
    } else if (view === 'saved') {
        savedView.classList.add('active');
        generateView.classList.remove('active');
        navSaved.classList.add('active');
        navGenerate.classList.remove('active');
    }
}

export function showSuggestions() {
    const topicInput = document.getElementById('topic');
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    for (const category in trendingTopics) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'suggestion-category';
        categoryDiv.innerHTML = `<h3>${category}</h3>`;
        trendingTopics[category].forEach(topic => {
            const item = document.createElement('span');
            item.className = 'suggestion-item';
            item.textContent = topic;
            item.addEventListener('click', () => {
                topicInput.value = topic;
                suggestionsDiv.style.display = 'none';
            });
            categoryDiv.appendChild(item);
        });
        suggestionsDiv.appendChild(categoryDiv);
    }
    suggestionsDiv.style.display = suggestionsDiv.style.display === 'none' ? 'block' : 'none';
}

export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return toast;
}

export function updateCharCounter(cardElement, text) {
    const charCount = text.length;
    const { isNearLimit, isOverLimit } = getCharCountStatus(charCount);

    const counterElement = cardElement.querySelector('.char-count');
    const warningElement = cardElement.querySelector('.warning-icon');
    const charCounterDiv = cardElement.querySelector('.char-counter');

    counterElement.textContent = `${charCount} / 3,000 characters`;
    counterElement.className = `char-count ${isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''}`;

    if (warningElement) warningElement.remove();

    if (isOverLimit) {
        const warningSpan = document.createElement('span');
        warningSpan.className = 'warning-icon';
        warningSpan.textContent = '⚠️ Exceeds LinkedIn limit';
        charCounterDiv.appendChild(warningSpan);
    } else if (isNearLimit) {
        const warningSpan = document.createElement('span');
        warningSpan.className = 'warning-icon';
        warningSpan.textContent = '⏱️ Approaching limit';
        charCounterDiv.appendChild(warningSpan);
    }
}

export function showLoadingState() {
    const draftsDiv = document.getElementById('drafts');
    const generateBtn = document.getElementById('generate-btn');
    draftsDiv.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-line" style="height: 24px; margin-bottom: 16px;"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
            <div style="height: 20px; margin: 20px 0;"></div>
            <div class="skeleton-line" style="height: 200px; margin-bottom: 16px;"></div>
            <div class="skeleton-line short" style="height: 16px;"></div>
            <div class="skeleton-line short" style="height: 40px; margin-top: 16px;"></div>
        </div>
        <div class="skeleton-loader">
            <div class="skeleton-line" style="height: 24px; margin-bottom: 16px;"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
            <div style="height: 20px; margin: 20px 0;"></div>
            <div class="skeleton-line" style="height: 200px; margin-bottom: 16px;"></div>
            <div class="skeleton-line short" style="height: 16px;"></div>
            <div class="skeleton-line short" style="height: 40px; margin-top: 16px;"></div>
        </div>
    `;
    generateBtn.textContent = 'Generating...';
}

export function showErrorMessage(message) {
    const draftsSection = document.getElementById('drafts-section');
    const draftsDiv = document.getElementById('drafts');
    draftsSection.style.display = 'block';
    draftsDiv.innerHTML = `
        <div style="background-color: #ffebee; border: 1px solid #f44336; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
            <p style="color: #c62828; margin: 0; font-weight: 500;">⚠️ Error</p>
            <p style="color: #d32f2f; margin: 8px 0 0 0;">${message}</p>
        </div>
    `;
    showToast(message, 'error', 5000);
}

export function displayDrafts(drafts) {
    const draftsDiv = document.getElementById('drafts');
    draftsDiv.innerHTML = '';
    const draftLetters = ['A', 'B', 'C'];

    drafts.forEach((draft, index) => {
        const draftDiv = document.createElement('div');
        draftDiv.className = `draft draft-${draftLetters[index]}`;
        draftDiv.dataset.draftIndex = index;

        const angle = draft.angle || '';
        const postText = draft.post || draft;
        const charCount = postText.length;
        const { isNearLimit, isOverLimit } = getCharCountStatus(charCount);

        draftDiv.innerHTML = `
            <div class="draft-card">
                <div class="draft-header">
                    <div class="draft-title-section">
                        <h3 class="draft-title">Draft ${draftLetters[index]}</h3>
                        ${angle ? `<p class="draft-angle">"${angle}"</p>` : ''}
                    </div>
                </div>
                <textarea class="draft-text" data-draft-index="${index}" placeholder="Edit your post here...">${postText}</textarea>
                <div class="draft-footer">
                    <div class="char-counter">
                        <span class="char-count ${isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''}">${charCount} / 3,000 characters</span>
                        ${isOverLimit ? '<span class="warning-icon">⚠️ Exceeds LinkedIn limit</span>' : isNearLimit ? '<span class="warning-icon">⏱️ Approaching limit</span>' : ''}
                    </div>
                </div>
                <div class="draft-actions">
                    <button class="btn-copy" onclick="window.copyDraft(${index})">📋 Copy to Clipboard</button>
                    <button class="btn-save" onclick="window.saveDraftFromTextarea(${index})">💾 Save Draft</button>
                </div>
            </div>
        `;

        draftsDiv.appendChild(draftDiv);

        const textarea = draftDiv.querySelector('.draft-text');
        textarea.addEventListener('input', (e) => {
            updateCharCounter(draftDiv, e.target.value);
        });
    });
}

export function copyDraft(index) {
    const textareas = document.querySelectorAll('.draft-text');
    const draftText = textareas[index].value;
    copyToClipboard(draftText).then(() => {
        showToast('✅ Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
    });
}

export function saveDraftFromTextarea(index) {
    const textareas = document.querySelectorAll('.draft-text');
    const draftText = textareas[index].value;
    if (!draftText.trim()) {
        showToast('Cannot save an empty draft.', 'error');
        return;
    }
    saveDraft(draftText);
    showToast('✅ Draft saved!', 'success');
}

export function saveDraft(draftText) {
    state.savedDrafts.push(draftText);
    updateSavedDrafts();
}

export function updateSavedDrafts() {
    const savedDraftsDiv = document.getElementById('saved-drafts');
    savedDraftsDiv.innerHTML = '';
    if (state.savedDrafts.length === 0) {
        savedDraftsDiv.innerHTML = '<p>No saved drafts yet.</p>';
        return;
    }
    state.savedDrafts.forEach((draft, index) => {
        const draftDiv = document.createElement('div');
        draftDiv.className = 'saved-draft';
        draftDiv.innerHTML = `
            <div class="saved-draft-content">
                <textarea class="saved-draft-text" readonly>${draft}</textarea>
            </div>
            <div class="saved-draft-actions">
                <button onclick="window.copySavedDraft(${index})">📋 Copy</button>
                <button onclick="window.deleteDraft(${index})">🗑️ Delete</button>
            </div>
        `;
        savedDraftsDiv.appendChild(draftDiv);
    });
}

export function copySavedDraft(index) {
    const draftText = state.savedDrafts[index];
    copyToClipboard(draftText).then(() => {
        showToast('✅ Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
    });
}

export function deleteDraft(index) {
    state.savedDrafts.splice(index, 1);
    updateSavedDrafts();
    showToast('🗑️ Draft deleted', 'success');
}

export async function generateDrafts() {
    const topic = document.getElementById('topic').value.trim();
    const style = document.getElementById('post-style').value;
    const tone = document.getElementById('tone').value;
    const perspective = document.getElementById('perspective').value.trim();
    const cta = document.getElementById('cta').value;
    const apiKey = document.getElementById('api-key').value.trim();
    const draftsSection = document.getElementById('drafts-section');
    const generateBtn = document.getElementById('generate-btn');

    if (!topic) { showErrorMessage('Please enter a topic to generate posts.'); return; }
    if (!style) { showErrorMessage('Please select a post style.'); return; }
    if (!tone) { showErrorMessage('Please select a tone for your posts.'); return; }
    if (!apiKey) { showErrorMessage('Please enter your Gemini API key.'); return; }

    draftsSection.style.display = 'block';
    showLoadingState();
    generateBtn.disabled = true;

    try {
        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt(topic, style, tone, perspective, cta);

        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
            else if (response.status === 400) throw new Error('Invalid API key or request. Please check your Gemini API key.');
            else throw new Error(`API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
        }

        const geminiData = await response.json();
        if (!geminiData.candidates?.[0]?.content) throw new Error('Unexpected API response format.');

        const drafts = parseDraftsResponse(geminiData.candidates[0].content.parts[0].text);
        displayDrafts(drafts);

    } catch (error) {
        console.error('Error generating drafts:', error);
        showErrorMessage(error.message || 'Failed to generate drafts. Please try again.');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Posts';
    }
}

export function init() {
    // Theme toggle
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Navigation
    document.getElementById('nav-generate').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('generate');
    });
    document.getElementById('nav-saved').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('saved');
    });

    // Quick topics
    document.querySelectorAll('.quick-topics a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('topic').value = e.target.dataset.topic;
            switchView('generate');
        });
    });

    document.getElementById('show-suggestions').addEventListener('click', showSuggestions);
    document.getElementById('generate-btn').addEventListener('click', generateDrafts);

    // Expose onclick-required functions on window
    window.copyDraft = copyDraft;
    window.saveDraftFromTextarea = saveDraftFromTextarea;
    window.copySavedDraft = copySavedDraft;
    window.deleteDraft = deleteDraft;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    updateSavedDrafts();
}

// Auto-init in browser only
if (typeof process === 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}

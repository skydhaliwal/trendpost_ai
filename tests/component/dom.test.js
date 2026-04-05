import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupDOM } from '../setup.js';
import {
    state,
    switchView,
    showToast,
    updateCharCounter,
    showErrorMessage,
    displayDrafts,
    saveDraft,
    updateSavedDrafts,
    deleteDraft
} from '../../src/app.js';

beforeEach(() => {
    setupDOM();
    state.savedDrafts = [];
    vi.clearAllMocks();
});

describe('switchView', () => {
    it('activates generate view and deactivates saved view', () => {
        switchView('generate');
        expect(document.getElementById('generate-view').classList.contains('active')).toBe(true);
        expect(document.getElementById('saved-view').classList.contains('active')).toBe(false);
    });

    it('activates saved view and deactivates generate view', () => {
        switchView('saved');
        expect(document.getElementById('saved-view').classList.contains('active')).toBe(true);
        expect(document.getElementById('generate-view').classList.contains('active')).toBe(false);
    });

    it('sets correct nav active state when switching to saved', () => {
        switchView('saved');
        expect(document.getElementById('nav-saved').classList.contains('active')).toBe(true);
        expect(document.getElementById('nav-generate').classList.contains('active')).toBe(false);
    });
});

describe('showToast', () => {
    it('creates a toast element in the container', () => {
        showToast('Test message', 'success', 0);
        const toasts = document.querySelectorAll('#toast-container .toast');
        expect(toasts.length).toBe(1);
        expect(toasts[0].textContent).toBe('Test message');
    });

    it('applies the correct type class', () => {
        showToast('Error!', 'error', 0);
        const toast = document.querySelector('#toast-container .toast');
        expect(toast.classList.contains('error')).toBe(true);
    });

    it('creates multiple toasts independently', () => {
        showToast('First', 'info', 0);
        showToast('Second', 'success', 0);
        expect(document.querySelectorAll('#toast-container .toast').length).toBe(2);
    });
});

describe('updateCharCounter', () => {
    function makeCardElement(charCount, text) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="char-counter">
                <span class="char-count">${charCount} / 3,000 characters</span>
            </div>
        `;
        return div;
    }

    it('updates char count text', () => {
        const card = makeCardElement(0, '');
        const text = 'Hello world';
        updateCharCounter(card, text);
        expect(card.querySelector('.char-count').textContent).toContain(`${text.length} / 3,000 characters`);
    });

    it('adds near-limit class at 2800 characters', () => {
        const card = makeCardElement(0, '');
        updateCharCounter(card, 'a'.repeat(2800));
        expect(card.querySelector('.char-count').classList.contains('near-limit')).toBe(true);
    });

    it('adds over-limit class at 3100 characters', () => {
        const card = makeCardElement(0, '');
        updateCharCounter(card, 'a'.repeat(3100));
        expect(card.querySelector('.char-count').classList.contains('over-limit')).toBe(true);
    });

    it('adds warning icon when over limit', () => {
        const card = makeCardElement(0, '');
        updateCharCounter(card, 'a'.repeat(3100));
        expect(card.querySelector('.warning-icon')).not.toBeNull();
        expect(card.querySelector('.warning-icon').textContent).toContain('Exceeds LinkedIn limit');
    });

    it('removes previous warning icon on update', () => {
        const card = makeCardElement(0, '');
        updateCharCounter(card, 'a'.repeat(3100));
        updateCharCounter(card, 'short text');
        expect(card.querySelector('.warning-icon')).toBeNull();
    });
});

describe('showErrorMessage', () => {
    it('makes drafts-section visible', () => {
        showErrorMessage('Something went wrong');
        expect(document.getElementById('drafts-section').style.display).toBe('block');
    });

    it('displays the error message in drafts div', () => {
        showErrorMessage('Network failure');
        expect(document.getElementById('drafts').innerHTML).toContain('Network failure');
    });

    it('also shows a toast', () => {
        showErrorMessage('API error');
        expect(document.querySelectorAll('#toast-container .toast').length).toBeGreaterThan(0);
    });
});

describe('displayDrafts', () => {
    const mockDrafts = [
        { label: 'Draft 1', angle: 'Angle A', post: 'Post content A #AI #Leadership' },
        { label: 'Draft 2', angle: 'Angle B', post: 'Post content B #Tech #Engineering' }
    ];

    it('renders two draft cards', () => {
        displayDrafts(mockDrafts);
        expect(document.querySelectorAll('.draft-card').length).toBe(2);
    });

    it('renders draft titles as Draft A and Draft B', () => {
        displayDrafts(mockDrafts);
        const titles = document.querySelectorAll('.draft-title');
        expect(titles[0].textContent).toBe('Draft A');
        expect(titles[1].textContent).toBe('Draft B');
    });

    it('renders the angle text', () => {
        displayDrafts(mockDrafts);
        expect(document.querySelector('.draft-angle').textContent).toContain('Angle A');
    });

    it('renders post content in textareas', () => {
        displayDrafts(mockDrafts);
        const textareas = document.querySelectorAll('.draft-text');
        expect(textareas[0].value).toBe('Post content A #AI #Leadership');
        expect(textareas[1].value).toBe('Post content B #Tech #Engineering');
    });

    it('shows character count for each draft', () => {
        displayDrafts(mockDrafts);
        const counters = document.querySelectorAll('.char-count');
        expect(counters.length).toBe(2);
    });
});

describe('saveDraft and updateSavedDrafts', () => {
    it('adds a draft to state', () => {
        saveDraft('My saved post');
        expect(state.savedDrafts).toContain('My saved post');
    });

    it('renders saved drafts in the DOM', () => {
        saveDraft('Draft one');
        saveDraft('Draft two');
        expect(document.querySelectorAll('.saved-draft').length).toBe(2);
    });

    it('shows empty message when no drafts', () => {
        updateSavedDrafts();
        expect(document.getElementById('saved-drafts').textContent).toContain('No saved drafts yet');
    });
});

describe('deleteDraft', () => {
    it('removes the draft from state', () => {
        saveDraft('Keep me');
        saveDraft('Delete me');
        deleteDraft(1);
        expect(state.savedDrafts).toHaveLength(1);
        expect(state.savedDrafts[0]).toBe('Keep me');
    });

    it('updates the DOM after deletion', () => {
        saveDraft('Only draft');
        deleteDraft(0);
        expect(document.querySelectorAll('.saved-draft').length).toBe(0);
    });

    it('shows a toast after deletion', () => {
        saveDraft('Draft');
        deleteDraft(0);
        expect(document.querySelectorAll('#toast-container .toast').length).toBeGreaterThan(0);
    });
});

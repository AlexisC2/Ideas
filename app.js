document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("generateBtn");
    const display = document.getElementById("ideaDisplay");
    const copyBtn = document.getElementById("copyBtn");
    const shareBtn = document.getElementById("shareBtn");
    const categoryButtonsContainer = document.getElementById("category-buttons");
    const submissionForm = document.getElementById("submission-form");
    const ideaInput = document.getElementById("idea-input");
    const categorySelect = document.getElementById("category-select");
    const toast = document.getElementById("toast-notification");
    const themeToggle = document.getElementById("theme-toggle");
    const historyList = document.getElementById("history-list");

    let currentCategory = "Tech";
    let toastTimeout;
    // history (kept short)
    let ideaHistory = [];

    // persistent idea store (backed by localStorage)
    let ideaStore = {};
    try {
        const raw = localStorage.getItem('ideas');
        if (raw) {
            ideaStore = JSON.parse(raw) || {};
        } else {
            ideaStore = (typeof ideas !== 'undefined') ? ideas : {};
            localStorage.setItem('ideas', JSON.stringify(ideaStore));
        }
    } catch (err) {
        console.warn('Failed to load ideas from localStorage', err);
        ideaStore = (typeof ideas !== 'undefined') ? ideas : {};
    }

    try {
        const rawH = localStorage.getItem('ideaHistory');
        if (rawH) ideaHistory = JSON.parse(rawH) || [];
    } catch (err) {
        ideaHistory = [];
    }

    function saveIdeasToStorage() {
        try { localStorage.setItem('ideas', JSON.stringify(ideaStore)); } catch (e) { console.warn('Save ideas failed', e); }
    }

    function saveHistoryToStorage() {
        try { localStorage.setItem('ideaHistory', JSON.stringify(ideaHistory)); } catch (e) { console.warn('Save history failed', e); }
    }

    function showToast(message, duration = 3000) {
        if (!toast) return;
        toast.textContent = message;
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // --- Theme Handling ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- App Logic ---
    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = "";
        ideaHistory.forEach(idea => {
            const li = document.createElement("li");
            li.textContent = idea;
            historyList.appendChild(li);
        });
    }

    function updateHistory(newIdea) {
        if (!newIdea) return;
        const exists = ideaHistory.some(i => i.toLowerCase() === newIdea.toLowerCase());
        if (!exists) {
            ideaHistory.unshift(newIdea);
            if (ideaHistory.length > 5) ideaHistory.pop();
            renderHistory();
            saveHistoryToStorage();
        }
    }

    function populateCategorySelect() {
        if (!categorySelect) return;
        categorySelect.innerHTML = "";
        for (const category in ideaStore) {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        }
    }

    function generateIdea() {
        if (!ideaStore[currentCategory] || ideaStore[currentCategory].length === 0) {
            if (display) display.textContent = `No ideas in '${currentCategory}' yet. Submit one!`;
            return;
        }
        const ideaList = ideaStore[currentCategory];
        const randomIndex = Math.floor(Math.random() * ideaList.length);
        const idea = ideaList[randomIndex];
        if (display) {
            display.style.opacity = 0;
            setTimeout(() => {
                display.textContent = idea;
                display.style.opacity = 1;
                updateHistory(idea);
            }, 300);
        } else {
            updateHistory(idea);
        }
    }

    function updateCategoryButtons() {
        // Render category buttons dynamically from ideas
        if (!categoryButtonsContainer) return;
        categoryButtonsContainer.innerHTML = '';
        Object.keys(ideaStore).forEach((category, i) => {
            const btnEl = document.createElement('button');
            btnEl.className = 'category-btn' + (i === 0 ? ' active' : '');
            btnEl.dataset.category = category;
            btnEl.type = 'button';
            btnEl.textContent = category;
            btnEl.addEventListener('click', (e) => {
                currentCategory = e.currentTarget.dataset.category;
                categoryButtonsContainer.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                generateIdea();
            });
            categoryButtonsContainer.appendChild(btnEl);
        });
    }

    submissionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newIdea = ideaInput.value.trim();
        const selectedCategory = categorySelect.value;
        if (!newIdea) {
            showToast('Please enter an idea before submitting.', 2500);
            return;
        }
        if (!selectedCategory) {
            showToast('Please select a category.', 2500);
            return;
        }

        if (!ideaStore[selectedCategory]) ideaStore[selectedCategory] = [];
        const dup = ideaStore[selectedCategory].some(i => i.toLowerCase() === newIdea.toLowerCase());
        if (dup) {
            showToast('This idea already exists in the selected category.', 2500);
            ideaInput.value = '';
            return;
        }

        ideaStore[selectedCategory].push(newIdea);
        saveIdeasToStorage();
        ideaInput.value = "";
        currentCategory = selectedCategory;
        if (categoryButtonsContainer) {
            updateCategoryButtons();
            categoryButtonsContainer.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            const btn = categoryButtonsContainer.querySelector(`[data-category='${selectedCategory}']`);
            if (btn) btn.classList.add('active');
        }
        if (display) display.style.opacity = 0;
        setTimeout(() => {
            if (display) {
                display.textContent = newIdea;
                display.style.opacity = 1;
            }
            updateHistory(newIdea);
            showToast('Idea submitted — thank you!', 2500);
        }, 300);
    });

    if (btn) btn.addEventListener("click", generateIdea);

    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
            const ideaText = display ? display.textContent : '';
            if (ideaText && ideaText !== "Click the button to get a random idea!" && ideaText.indexOf('No ideas in') === -1) {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(ideaText);
                    } else {
                        // Fallback
                        const ta = document.createElement('textarea');
                        ta.value = ideaText;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    }
                    if(toastTimeout) clearTimeout(toastTimeout);
                    if (toast) toast.classList.add("show");
                    toastTimeout = setTimeout(() => {
                        if (toast) toast.classList.remove("show");
                    }, 3000);
                } catch (err) {
                    console.warn('Copy failed', err);
                }
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            const ideaText = display ? display.textContent : '';
            if (ideaText && ideaText !== "Click the button to get a random idea!" && ideaText.indexOf('No ideas in') === -1) {
                const tweetText = encodeURIComponent(ideaText + " #RandomIdea");
                const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
                // Use anchor for safer noopener behavior
                const a = document.createElement('a');
                a.href = twitterUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }

    // --- Initial Setup ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    populateCategorySelect();
    updateCategoryButtons();
    // render persisted history on load
    renderHistory();
    generateIdea();
});

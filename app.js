document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const generateBtn = document.getElementById("generateBtn");
    const ideaDisplay = document.getElementById("ideaDisplay");
    const copyBtn = document.getElementById("copyBtn");
    const shareBtn = document.getElementById("shareBtn");
    const categoryButtonsContainer = document.getElementById("category-buttons");
    const submissionForm = document.getElementById("submission-form");
    const ideaInput = document.getElementById("idea-input");
    const categorySelect = document.getElementById("category-select");
    const toastNotification = document.getElementById("toast-notification");
    const themeToggle = document.getElementById("theme-toggle");
    const historyList = document.getElementById("history-list");
    const historySearch = document.getElementById("history-search");
    const errorDisplay = document.getElementById("error-message");

    // --- Application State ---
    let currentCategory = "Tech";
    let ideaStore = {};
    let ideaHistory = [];
    let toastTimeout;

    // --- Initialization ---
    function initialize() {
        loadIdeasFromStorage();
        loadHistoryFromStorage();
        loadTheme();
        renderCategoryButtons();
        populateCategorySelect();
        renderHistory();
        generateIdea();
        setupEventListeners();
    }

    // --- Data Management ---
    function loadIdeasFromStorage() {
        try {
            const rawIdeas = localStorage.getItem('ideas');
            if (rawIdeas) {
                ideaStore = JSON.parse(rawIdeas) || {};
            } else {
                // Fallback to a global 'ideas' variable if it exists
                ideaStore = (typeof ideas !== 'undefined') ? ideas : {};
                saveIdeasToStorage();
            }
        } catch (error) {
            console.warn('Failed to load ideas from localStorage', error);
            ideaStore = (typeof ideas !== 'undefined') ? ideas : {};
        }
    }

    function loadHistoryFromStorage() {
        try {
            const rawHistory = localStorage.getItem('ideaHistory');
            if (rawHistory) {
                ideaHistory = JSON.parse(rawHistory) || [];
            }
        } catch (error) {
            console.warn('Failed to load history from localStorage', error);
            ideaHistory = [];
        }
    }

    function saveIdeasToStorage() {
        try {
            localStorage.setItem('ideas', JSON.stringify(ideaStore));
        } catch (error) {
            console.warn('Failed to save ideas', error);
        }
    }

    function saveHistoryToStorage() {
        try {
            localStorage.setItem('ideaHistory', JSON.stringify(ideaHistory));
        } catch (error) {
            console.warn('Failed to save history', error);
        }
    }

    // --- UI Updates ---
    function showToast(message, duration = 3000) {
        if (!toastNotification) return;

        toastNotification.textContent = message;
        toastNotification.classList.add('show');

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }

    function displayError(message) {
        if (!errorDisplay) return;
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }

    function clearError() {
        if (!errorDisplay) return;
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }

    function renderHistory(ideasToShow = ideaHistory) {
        if (!historyList) return;
        historyList.innerHTML = "";
        ideasToShow.forEach((idea, index) => {
            const li = document.createElement("li");
            li.dataset.id = idea.id;

            const ideaText = document.createElement('span');
            ideaText.textContent = idea.text;
            li.appendChild(ideaText);

            const controls = document.createElement('div');
            controls.className = 'history-controls';

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn';
            editButton.addEventListener('click', () => editIdea(idea.id, ideaText, controls));
            controls.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => deleteIdea(idea.id));
            controls.appendChild(deleteButton);

            li.appendChild(controls);
            historyList.appendChild(li);
        });
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

    function renderCategoryButtons() {
        if (!categoryButtonsContainer) return;
        categoryButtonsContainer.innerHTML = '';
        Object.keys(ideaStore).forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.dataset.category = category;
            button.type = 'button';
            button.textContent = category;
            categoryButtonsContainer.appendChild(button);
        });

        // Set the first button as active
        const firstButton = categoryButtonsContainer.querySelector('.category-btn');
        if (firstButton) {
            firstButton.classList.add('active');
        }
    }

    function updateActiveCategoryButton(category) {
        if (!categoryButtonsContainer) return;
        categoryButtonsContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const buttonToActivate = categoryButtonsContainer.querySelector(`[data-category='${category}']`);
        if (buttonToActivate) {
            buttonToActivate.classList.add('active');
        }
    }

    // --- Theme Handling ---
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    }

    function filterHistory() {
        const searchTerm = historySearch.value.toLowerCase();
        const filteredIdeas = ideaHistory.filter(idea => idea.text.toLowerCase().includes(searchTerm));
        renderHistory(filteredIdeas);
    }

    function handleThemeToggle() {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    // --- Core Logic ---
    function generateIdea() {
        if (!ideaStore[currentCategory] || ideaStore[currentCategory].length === 0) {
            if (ideaDisplay) {
                ideaDisplay.textContent = `No ideas in '${currentCategory}' yet. Submit one!`;
            }
            return;
        }

        const ideaList = ideaStore[currentCategory];
        const randomIndex = Math.floor(Math.random() * ideaList.length);
        const ideaText = ideaList[randomIndex];

        const idea = {
            id: Date.now(),
            text: ideaText,
        };

        if (ideaDisplay) {
            ideaDisplay.style.opacity = 0;
            setTimeout(() => {
                ideaDisplay.textContent = idea.text;
                ideaDisplay.style.opacity = 1;
                updateHistory(idea);
            }, 300);
        } else {
            updateHistory(idea);
        }
    }

    function updateHistory(newIdea) {
        if (!newIdea || !newIdea.text) return;

        const isDuplicate = ideaHistory.some(idea => idea.text.toLowerCase() === newIdea.text.toLowerCase());
        if (!isDuplicate) {
            ideaHistory.unshift(newIdea);
            if (ideaHistory.length > 20) {
                ideaHistory.pop();
            }
            renderHistory();
            saveHistoryToStorage();
        }
    }

    function editIdea(id, textElement, controlsElement) {
        const currentText = textElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        textElement.replaceWith(input);
        input.focus();

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'save-btn';

        const originalControls = controlsElement.innerHTML;
        controlsElement.innerHTML = '';
        controlsElement.appendChild(saveButton);

        const save = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                const ideaIndex = ideaHistory.findIndex(idea => idea.id === id);
                if (ideaIndex !== -1) {
                    ideaHistory[ideaIndex].text = newText;
                    saveHistoryToStorage();
                }
                const ideaEntry = Object.values(ideaStore).flat().find(idea => idea === currentText);
                if (ideaEntry) {
                    for (const category in ideaStore) {
                        const index = ideaStore[category].indexOf(currentText);
                        if (index > -1) {
                            ideaStore[category][index] = newText;
                            saveIdeasToStorage();
                            break;
                        }
                    }
                }
            }
            renderHistory();
        };

        saveButton.addEventListener('click', save);
        input.addEventListener('blur', () => {
            controlsElement.innerHTML = originalControls;
            renderHistory();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                save();
            } else if (e.key === 'Escape') {
                renderHistory();
            }
        });
    }

    function validateInput(text) {
        const maxLength = 280;
        const invalidChars = /[<>()&/\\'"{}|]/;

        if (!text || text.trim() === '') {
            return "Idea cannot be empty.";
        }
        if (text.length > maxLength) {
            return `Idea is too long (maximum ${maxLength} characters).`;
        }
        if (invalidChars.test(text)) {
            return "Idea contains invalid characters.";
        }
        return null; // No error
    }

    function deleteIdea(id) {
        const ideaIndex = ideaHistory.findIndex(idea => idea.id === id);
        if (ideaIndex > -1) {
            const [deletedIdea] = ideaHistory.splice(ideaIndex, 1);
            saveHistoryToStorage();

            for (const category in ideaStore) {
                const index = ideaStore[category].indexOf(deletedIdea.text);
                if (index > -1) {
                    ideaStore[category].splice(index, 1);
                    saveIdeasToStorage();
                    break;
                }
            }
            renderHistory();
        }
    }

    function handleIdeaSubmission(event) {
        event.preventDefault();
        clearError();
        const rawIdea = ideaInput.value;
        const selectedCategory = categorySelect.value;

        const validationError = validateInput(rawIdea);
        if (validationError) {
            displayError(validationError);
            return;
        }

        const newIdea = DOMPurify.sanitize(rawIdea.trim());

        if (!selectedCategory) {
            showToast('Please select a category.', 2500);
            return;
        }

        if (!ideaStore[selectedCategory]) {
            ideaStore[selectedCategory] = [];
        }

        const isDuplicate = ideaStore[selectedCategory].some(idea => idea.toLowerCase() === newIdea.toLowerCase());
        if (isDuplicate) {
            showToast('This idea already exists in the selected category.', 2500);
            ideaInput.value = '';
            return;
        }

        ideaStore[selectedCategory].push(newIdea);
        saveIdeasToStorage();

        ideaInput.value = "";
        currentCategory = selectedCategory;

        renderCategoryButtons();
        updateActiveCategoryButton(selectedCategory);

        if (ideaDisplay) {
            ideaDisplay.style.opacity = 0;
        }

        setTimeout(() => {
            const idea = {
                id: Date.now(),
                text: newIdea,
            };
            if (ideaDisplay) {
                ideaDisplay.textContent = idea.text;
                ideaDisplay.style.opacity = 1;
            }
            updateHistory(idea);
            showToast('Idea submitted — thank you!', 2500);
        }, 300);
    }

    async function copyIdeaToClipboard() {
        const ideaText = ideaDisplay ? ideaDisplay.textContent : '';
        if (ideaText && ideaText !== "Click the button to get a random idea!" && !ideaText.startsWith('No ideas in')) {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(ideaText);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = ideaText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
                showToast('Idea copied to clipboard!', 2000);
            } catch (error) {
                console.warn('Copy failed', error);
                showToast('Failed to copy idea.', 2000);
            }
        }
    }

    function shareIdea() {
        const ideaText = ideaDisplay ? ideaDisplay.textContent : '';
        if (ideaText && ideaText !== "Click the button to get a random idea!" && !ideaText.startsWith('No ideas in')) {
            const tweetText = encodeURIComponent(ideaText + " #RandomIdea");
            const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
            const anchor = document.createElement('a');
            anchor.href = twitterUrl;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        }
    }

    function handleCategoryClick(event) {
        if (event.target.classList.contains('category-btn')) {
            currentCategory = event.target.dataset.category;
            updateActiveCategoryButton(currentCategory);
            generateIdea();
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        if (generateBtn) {
            generateBtn.addEventListener("click", generateIdea);
        }
        if (copyBtn) {
            copyBtn.addEventListener("click", copyIdeaToClipboard);
        }
        if (shareBtn) {
            shareBtn.addEventListener("click", shareIdea);
        }
        if (submissionForm) {
            submissionForm.addEventListener("submit", handleIdeaSubmission);
        }
        if (themeToggle) {
            themeToggle.addEventListener('change', handleThemeToggle);
        }
        if (categoryButtonsContainer) {
            categoryButtonsContainer.addEventListener('click', handleCategoryClick);
        }
        if (historySearch) {
            historySearch.addEventListener('input', filterHistory);
        }
    }

    // --- Run Application ---
    initialize();
});

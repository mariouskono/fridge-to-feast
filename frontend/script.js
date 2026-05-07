// Analysis API & UI Logic for Uji Coba (Demo)
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    const dropZone = document.getElementById('dropZone');
    
    const loadingState = document.getElementById('loadingState');
    const resultsData = document.getElementById('resultsData');
    const emptyState = document.getElementById('emptyState');
    const statusBadge = document.getElementById('statusBadge');
    
    const tagsContainer = document.getElementById('tagsContainer');
    const recipeContainer = document.getElementById('recipeContainer');

    // Modal Elements
    const recipeModal = document.getElementById('recipeModal');
    const recipeModalContent = document.getElementById('recipeModalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalScore = document.getElementById('modalScore');
    const modalTitle = document.getElementById('modalTitle');
    const modalIngredients = document.getElementById('modalIngredients');
    const modalSteps = document.getElementById('modalSteps');

    let selectedFile = null;

    // Handle Image Selection
    function processFile(file) {
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                dropZone.classList.add('hidden'); // Hide dropzone for cleaner UI
            };
            reader.readAsDataURL(file);
            analyzeBtn.disabled = false;
        }
    }

    imageInput.addEventListener('change', (event) => {
        processFile(event.target.files[0]);
    });

    // Allow clicking the preview to select a new image
    imagePreview.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
    imagePreview.title = 'Click to change image';
    imagePreview.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Drag and Drop Effects
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        if (files && files.length > 0) {
            imageInput.files = files; // Sync the input
            processFile(files[0]);
        }
    });

    // Handle API Request
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // UI State: Loading
        analyzeBtn.disabled = true;
        emptyState.classList.add('hidden');
        resultsData.classList.add('hidden');
        
        loadingState.classList.remove('hidden');
        loadingState.classList.add('flex');
        
        statusBadge.textContent = 'Processing';
        statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            // Target komputasi backend lokal
            const response = await fetch('https://mariouskono-fridgetofeast.hf.space/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            renderResults(data);

        } catch (error) {
            console.error('Computation Error:', error);
            alert('Failed to connect to the backend infrastructure. Ensure the Hugging Face space is active.');
            resetUI();
        }
    });

    function renderResults(data) {
        // UI State: Success
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        
        resultsData.classList.remove('hidden');
        resultsData.classList.add('flex');
        
        analyzeBtn.disabled = false;

        statusBadge.textContent = 'Analysis Complete';
        statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';

        // Render Tags
        tagsContainer.innerHTML = '';
        if (data.detected_translated && data.detected_translated.length > 0) {
            data.detected_translated.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border border-primary-200 dark:border-primary-800 shadow-sm';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
        } else {
            tagsContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-dark-textMuted">No recognizable entities detected.</p>';
        }

        // Render Recipes
        recipeContainer.innerHTML = '';
        if (data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'p-6 rounded-3xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-dark-card transition-all cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 group';
                
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${recipe.title}</h4>
                        <span class="inline-flex items-center px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800 text-xs font-bold bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 ml-3 whitespace-nowrap">
                            Score: ${recipe.match_score}
                        </span>
                    </div>
                    <p class="text-sm text-slate-500 dark:text-dark-textMuted line-clamp-3 mb-4">${recipe.ingredients}</p>
                    <div class="text-primary-600 dark:text-primary-400 text-sm font-bold flex items-center">
                        View Recipe
                        <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                `;

                // Add click listener to open modal
                card.addEventListener('click', () => openModal(recipe));
                
                recipeContainer.appendChild(card);
            });
        } else {
            recipeContainer.innerHTML = '<p class="text-sm text-slate-500 dark:text-dark-textMuted col-span-2">No recipes matched the current ingredient matrix.</p>';
        }
    }

    function openModal(recipe) {
        modalTitle.textContent = recipe.title;
        modalScore.textContent = `Match Score: ${recipe.match_score}`;
        
        // --- Parse Ingredients ---
        let rawIngredients = recipe.ingredients || "";
        let ingArray = rawIngredients.includes('--') ? rawIngredients.split('--') : rawIngredients.split(',');
        
        modalIngredients.innerHTML = ingArray
            .map(item => item.trim())
            .filter(item => item.length > 0 && item !== '-')
            .map(item => {
                if (item.endsWith(':')) {
                    return `<div class="mt-5 mb-2 font-bold text-slate-800 dark:text-slate-100 text-base tracking-wide">${item}</div>`;
                }
                return `<div class="flex items-start mb-2.5"><span class="text-primary-500 mr-2.5 mt-0.5 font-bold">•</span><span class="text-slate-600 dark:text-slate-300 leading-relaxed">${item}</span></div>`;
            })
            .join('');
        
        // --- Parse Steps ---
        let rawSteps = recipe.steps || "";
        let stepArray = rawSteps.includes('--') ? rawSteps.split('--') : rawSteps.split(/(?:\d+\.|\n)/);
        
        let stepCounter = 1;
        modalSteps.innerHTML = stepArray
            .map(item => item.trim())
            .filter(item => item.length > 0 && item !== '-')
            .map(item => {
                let html = `<div class="flex items-start mb-5 group"><span class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center justify-center text-sm font-bold mr-4 mt-0.5 shadow-sm border border-slate-200 dark:border-slate-700/50">${stepCounter}</span><span class="text-slate-600 dark:text-slate-300 leading-relaxed mt-1">${item}</span></div>`;
                stepCounter++;
                return html;
            })
            .join('');

        recipeModal.classList.remove('hidden');
        recipeModal.classList.add('flex');  
        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => {
            recipeModal.classList.remove('opacity-0');
            recipeModalContent.classList.remove('scale-95');
            recipeModalContent.classList.add('scale-100');
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        recipeModal.classList.add('opacity-0');
        recipeModalContent.classList.remove('scale-100');
        recipeModalContent.classList.add('scale-95');
        
        setTimeout(() => {
            recipeModal.classList.add('hidden');
            recipeModal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300); // Wait for transition
    }

    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal on click outside
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            closeModal();
        }
    });

    function resetUI() {
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        
        analyzeBtn.disabled = false;
        
        statusBadge.textContent = 'System Error';
        statusBadge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50';
    }
});
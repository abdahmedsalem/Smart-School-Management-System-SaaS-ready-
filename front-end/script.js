// Dashboard JavaScript - Optimized Version

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize charts
        initializeCharts();
        
        // Add lightweight interactive features
        initializeLightweightInteractivity();
        
        // Add minimal animations
        addMinimalAnimations();
        
        // Setup lightweight scroll handling
        setupLightweightScrolling();
        
        // Initialize year navigation
        initializeYearNavigation();
        
        // Initialize establishments navigation
        initializeEtablissementsNavigation();
        
        // Initialize establishments search
        initializeEtablissementsSearch();
    } catch (error) {
        console.log('Dashboard initialization error:', error);
    }
});

function initializeCharts() {
    try {
        // Élèves Chart - Optimized
        const elevesCtx = document.getElementById('elevesChart');
        if (elevesCtx) {
            new Chart(elevesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['1ère Année', '2ème Année', '3ème Année'],
                    datasets: [{
                        data: [5850, 3164, 2174],
                        backgroundColor: ['#007bff', '#28a745', '#ffc107'],
                        borderWidth: 0,
                        cutout: '60%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateRotate: true,
                        animateScale: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Personnel Chart - Optimized
        const personnelCtx = document.getElementById('personnelChart');
        if (personnelCtx) {
            new Chart(personnelCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Enseignant', 'Technique', 'Admin'],
                    datasets: [{
                        data: [458, 320, 125],
                        backgroundColor: ['#17a2b8', '#6f42c1', '#fd7e14'],
                        borderWidth: 0,
                        cutout: '60%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateRotate: true,
                        animateScale: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.log('Chart initialization error:', error);
    }
}

function initializeLightweightInteractivity() {
    try {
        // Lightweight hover effects using CSS classes instead of JS animations
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.classList.add('card-hover');
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('card-hover');
            });
        });

        // Simple click feedback for buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                this.classList.add('btn-clicked');
                setTimeout(() => {
                    this.classList.remove('btn-clicked');
                }, 150);
            });
        });

        // Form interactivity
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', function() {
                this.classList.add('form-updated');
                setTimeout(() => {
                    this.classList.remove('form-updated');
                }, 1000);
            });
        });

        // Table row selection
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('click', function() {
                tableRows.forEach(r => r.classList.remove('table-active'));
                this.classList.add('table-active');
            });
        });

        // Download button functionality
        const downloadBtns = document.querySelectorAll('.btn');
        downloadBtns.forEach(btn => {
            if (btn.textContent.includes('Télécharger')) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showSimpleDownloadProgress(this);
                });
            }
        });
    } catch (error) {
        console.log('Interactivity initialization error:', error);
    }
}

function showSimpleDownloadProgress(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Téléchargement...';
    button.disabled = true;
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Terminé';
        button.className = button.className.replace(/btn-(primary|info)/, 'btn-success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.className = button.className.replace('btn-success', 
                button.innerHTML.includes('formation') ? 'btn-primary' : 'btn-info');
        }, 1500);
    }, 1000);
}

function addMinimalAnimations() {
    try {
        // Simple number animation with fewer frames
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent);
            if (!isNaN(finalValue)) {
                simpleNumberAnimation(stat, finalValue);
            }
        });

        // Simple exam score animation
        const examScores = document.querySelectorAll('.exam-score');
        examScores.forEach(score => {
            const finalValue = parseInt(score.textContent);
            if (!isNaN(finalValue)) {
                simpleNumberAnimation(score, finalValue);
            }
        });

        // Minimal card animation
        const animatedCards = document.querySelectorAll('.card');
        animatedCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('card-loaded');
            }, index * 50);
        });
    } catch (error) {
        console.log('Animation initialization error:', error);
    }
}

function simpleNumberAnimation(element, finalValue) {
    const duration = 1000;
    const steps = 20;
    const stepValue = finalValue / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(stepValue * currentStep), finalValue);
        element.textContent = currentValue;
        
        if (currentStep >= steps) {
            clearInterval(interval);
            element.textContent = finalValue;
        }
    }, duration / steps);
}

function setupLightweightScrolling() {
    try {
        // Simple scroll-based visibility
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Only observe key elements
        const keyElements = document.querySelectorAll('.card, .exam-card, .establishment-card');
        keyElements.forEach(element => {
            observer.observe(element);
        });
    } catch (error) {
        console.log('Scroll setup error:', error);
    }
}

// Utility functions
function formatNumber(num) {
    return num.toLocaleString('fr-FR');
}

function calculatePercentage(value, total) {
    return ((value / total) * 100).toFixed(1);
}

// Add lightweight CSS
const style = document.createElement('style');
style.textContent = `
    .card-hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }
    
    .btn-clicked {
        transform: scale(0.98);
        transition: transform 0.1s ease;
    }
    
    .form-updated {
        border-color: #28a745 !important;
        transition: border-color 0.3s ease;
    }
    
    .table-active {
        background-color: rgba(0, 123, 255, 0.1) !important;
    }
    
    .card-loaded {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .card {
        opacity: 0;
        transform: translateY(10px);
    }
    
    .visible {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
`;
document.head.appendChild(style);

// Lightweight chart resizing
const debouncedResize = debounce(() => {
    try {
        if (typeof Chart !== 'undefined' && Chart.instances) {
            Chart.instances.forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
    } catch (error) {
        console.log('Chart resize error:', error);
    }
}, 250);

window.addEventListener('resize', debouncedResize);

// Year Navigation Functionality
function initializeYearNavigation() {
    try {
        // All available years (you can expand this array)
        const allYears = [
            '2018-2019', '2019-2020', '2020-2021', '2021-2022', 
            '2022-2023', '2023-2024', '2024-2025', '2025-2026', 
            '2026-2027', '2027-2028'
        ];
        
        let currentStartIndex = 3; // Starting from 2021-2022 (index 3)
        
        const prevBtn = document.getElementById('prevYears');
        const nextBtn = document.getElementById('nextYears');
        const yearButtonsContainer = document.getElementById('yearButtons');
        
        // Function to update displayed years
        function updateYearButtons() {
            const yearButtons = yearButtonsContainer.querySelectorAll('.btn-year-exact');
            
            // Update button content and data attributes
            for (let i = 0; i < 4; i++) {
                const yearIndex = currentStartIndex + i;
                if (yearIndex < allYears.length) {
                    yearButtons[i].textContent = allYears[yearIndex];
                    yearButtons[i].setAttribute('data-year', allYears[yearIndex]);
                    yearButtons[i].style.display = 'block';
                } else {
                    yearButtons[i].style.display = 'none';
                }
            }
            
            // Update button states
            updateButtonStates();
        }
        
        // Function to update button enabled/disabled states
        function updateButtonStates() {
            prevBtn.disabled = currentStartIndex <= 0;
            nextBtn.disabled = currentStartIndex >= allYears.length - 4;
            
            // Add visual feedback for disabled buttons
            if (prevBtn.disabled) {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.cursor = 'not-allowed';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.cursor = 'pointer';
            }
            
            if (nextBtn.disabled) {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.cursor = 'not-allowed';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            }
        }
        
        // Previous years button click
        prevBtn.addEventListener('click', function() {
            if (currentStartIndex > 0) {
                currentStartIndex--;
                updateYearButtons();
            }
        });
        
        // Next years button click
        nextBtn.addEventListener('click', function() {
            if (currentStartIndex < allYears.length - 4) {
                currentStartIndex++;
                updateYearButtons();
            }
        });
        
        // Year button click handlers
        yearButtonsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-year-exact')) {
                // Remove active class from all year buttons
                const allYearButtons = yearButtonsContainer.querySelectorAll('.btn-year-exact');
                allYearButtons.forEach(btn => btn.classList.remove('active-exact'));
                
                // Add active class to clicked button
                e.target.classList.add('active-exact');
                
                // Get selected year
                const selectedYear = e.target.getAttribute('data-year');
                console.log('Selected year:', selectedYear);
                
                // Here you can add functionality to load data for the selected year
                // For example: loadDataForYear(selectedYear);
            }
        });
        
        // Initialize the display
        updateYearButtons();
        
    } catch (error) {
        console.log('Year navigation initialization error:', error);
    }
}

// Function to load data for selected year (you can implement this)
function loadDataForYear(year) {
    console.log(`Loading data for year: ${year}`);
    // Add your data loading logic here
    // This could include AJAX calls to fetch data for the selected year
}

// Etablissements Data - Store all establishments info
const etablissementsData = [
    { 
        name: 'EETFP Boghe', 
        page: 1, 
        students: '850 eleves inscrits',
        specialites: 12,
        formateurs: 12,
        sections: 12
    },
    { 
        name: 'EETFP Nouakchott', 
        page: 1, 
        students: '920 eleves inscrits',
        specialites: 15,
        formateurs: 18,
        sections: 10
    },
    { 
        name: 'EETFP Rosso', 
        page: 1, 
        students: '720 eleves inscrits',
        specialites: 8,
        formateurs: 14,
        sections: 9
    },
    { 
        name: 'EETFP Kaedi', 
        page: 1, 
        students: '640 eleves inscrits',
        specialites: 10,
        formateurs: 16,
        sections: 11
    },
    { 
        name: 'EETFP Atar', 
        page: 2, 
        students: '480 eleves inscrits',
        specialites: 6,
        formateurs: 10,
        sections: 7
    },
    { 
        name: 'EETFP Kiffa', 
        page: 2, 
        students: '580 eleves inscrits',
        specialites: 9,
        formateurs: 13,
        sections: 8
    }
];

// Etablissements Navigation Function
function initializeEtablissementsNavigation() {
    try {
        const prevBtn = document.getElementById('prevEtablissements');
        const nextBtn = document.getElementById('nextEtablissements');
        const pages = document.querySelectorAll('.etablissements-page');
        const countElement = document.querySelector('.etablissements-count');
        
        let currentPage = 1;
        const totalPages = pages.length;
        
        // Update page display and navigation buttons
        function updatePageDisplay() {
            // Hide all pages
            pages.forEach(page => {
                page.style.display = 'none';
                page.classList.remove('active');
            });
            
            // Show current page
            const currentPageElement = document.querySelector(`.etablissements-page[data-page="${currentPage}"]`);
            if (currentPageElement) {
                currentPageElement.style.display = 'block';
                currentPageElement.classList.add('active');
            }
            
            // Update counter
            if (countElement) {
                const establishmentsPerPage = currentPage === 1 ? 4 : 2; // Page 1 has 4, page 2 has 2
                const startItem = currentPage === 1 ? 1 : 5; // Page 1: 1-4, Page 2: 5-6
                const endItem = currentPage === 1 ? 4 : 6; // Page 1: 1-4, Page 2: 5-6
                countElement.textContent = `(${startItem}-${endItem} sur 6)`;
            }
            
            // Update button states
            if (prevBtn) {
                prevBtn.disabled = currentPage === 1;
                prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
                prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
            }
            if (nextBtn) {
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
                nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
            }
        }
        
        // Function to navigate to specific page
        function navigateToPage(pageNumber) {
            if (pageNumber >= 1 && pageNumber <= totalPages) {
                currentPage = pageNumber;
                updatePageDisplay();
                return true;
            }
            return false;
        }
        
        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    updatePageDisplay();
                }
            });
        }
        
        // Next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePageDisplay();
                }
            });
        }
        
        // Initialize display
        updatePageDisplay();
        
        // Export navigation function for search
        window.navigateToEtablissementPage = navigateToPage;
        
    } catch (error) {
        console.log('Etablissements navigation initialization error:', error);
    }
}

// Etablissements Search Function
function initializeEtablissementsSearch() {
    try {
        const searchInput = document.getElementById('etablissementsSearch');
        const clearBtn = document.getElementById('clearSearch');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput || !clearBtn || !searchResults) {
            console.log('Search elements not found');
            return;
        }
        
        let searchTimeout;
        
        // Search function
        function performSearch(query) {
            if (!query || query.length < 2) {
                hideSearchResults();
                return;
            }
            
            const filteredResults = etablissementsData.filter(etablissement =>
                etablissement.name.toLowerCase().includes(query.toLowerCase())
            );
            
            displaySearchResults(filteredResults, query);
        }
        
        // Display search results
        function displaySearchResults(results, query) {
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="search-no-results">
                        <i class="fas fa-search text-muted"></i>
                        <p class="mb-0 mt-2">Aucun établissement trouvé pour "${query}"</p>
                    </div>
                `;
            } else {
                searchResults.innerHTML = results.map(etablissement => `
                    <div class="search-result-item" data-page="${etablissement.page}" data-name="${etablissement.name}">
                        <div class="search-result-icon">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="search-result-info">
                            <h6>${etablissement.name}</h6>
                            <small>${etablissement.students} • Page ${etablissement.page}</small>
                        </div>
                    </div>
                `).join('');
                
                // Add click handlers to results
                const resultItems = searchResults.querySelectorAll('.search-result-item');
                resultItems.forEach(item => {
                    item.addEventListener('click', function() {
                        const pageNumber = parseInt(this.getAttribute('data-page'));
                        const etablissementName = this.getAttribute('data-name');
                        
                        // Navigate to the page
                        if (window.navigateToEtablissementPage) {
                            window.navigateToEtablissementPage(pageNumber);
                        }
                        
                        // Clear search and hide results
                        searchInput.value = etablissementName;
                        hideSearchResults();
                        
                        // Highlight the selected establishment (optional visual feedback)
                        highlightEtablissement(etablissementName);
                    });
                });
            }
            
            showSearchResults();
        }
        
        // Show search results
        function showSearchResults() {
            searchResults.classList.add('show');
        }
        
        // Hide search results
        function hideSearchResults() {
            searchResults.classList.remove('show');
        }
        
        // Highlight establishment on page
        function highlightEtablissement(name) {
            // Remove any existing highlights
            document.querySelectorAll('.establishment-card-modern').forEach(card => {
                card.classList.remove('search-highlighted');
            });
            
            // Add highlight to matching establishment
            const establishmentCards = document.querySelectorAll('.establishment-title-modern');
            establishmentCards.forEach(titleElement => {
                if (titleElement.textContent.trim() === name) {
                    const card = titleElement.closest('.establishment-card-modern');
                    if (card) {
                        card.classList.add('search-highlighted');
                        // Remove highlight after 3 seconds
                        setTimeout(() => {
                            card.classList.remove('search-highlighted');
                        }, 3000);
                    }
                }
            });
        }
        
        // Search input event listener
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            // Show/hide clear button based on input
            if (query.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300); // Debounce search
        });
        
        // Clear button event listener
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            hideSearchResults();
            searchInput.focus();
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && 
                !searchResults.contains(e.target) && 
                !clearBtn.contains(e.target)) {
                hideSearchResults();
            }
        });
        
        // Show results when focusing on input (if there's content)
        searchInput.addEventListener('focus', function() {
            if (this.value.trim().length >= 2) {
                performSearch(this.value.trim());
            }
        });
        
        // Handle keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            const items = searchResults.querySelectorAll('.search-result-item');
            const activeItem = searchResults.querySelector('.search-result-item.active');
            let activeIndex = -1;
            
            if (activeItem) {
                activeIndex = Array.from(items).indexOf(activeItem);
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeIndex < items.length - 1) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[activeIndex + 1].classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeIndex > 0) {
                    if (activeItem) activeItem.classList.remove('active');
                    items[activeIndex - 1].classList.add('active');
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeItem) {
                    activeItem.click();
                }
            } else if (e.key === 'Escape') {
                hideSearchResults();
                this.blur();
            }
        });
        
    } catch (error) {
        console.log('Etablissements search initialization error:', error);
    }
}

// Export utility functions
window.dashboardUtils = {
    formatNumber,
    calculatePercentage,
    debounce,
    throttle,
    loadDataForYear,
    initializeEtablissementsNavigation,
    initializeEtablissementsSearch,
    etablissementsData
};
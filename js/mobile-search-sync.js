/**
 * Mobile Search Sync and Cross-Browser Compatibility
 * Untuk sync antara desktop search dan mobile search
 * Fixes Chrome mobile search issues
 */

(function() {
    'use strict';
    
    let isInitialized = false;
    let mobileSearchInitialized = false;
    
    // Enhanced search function yang boleh handle both inputs
    function enhancedSearchPosts() {
        console.log('Enhanced search triggered');
        
        // Get values from both search inputs
        const mainSearchInput = document.getElementById('search-input');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        let searchTerm = '';
        
        // Priority: use mobile input if it has focus, otherwise use main input
        if (mobileSearchInput && document.activeElement === mobileSearchInput) {
            searchTerm = mobileSearchInput.value.toLowerCase().trim();
            // Sync to main input if exists
            if (mainSearchInput) {
                mainSearchInput.value = mobileSearchInput.value;
            }
        } else if (mainSearchInput) {
            searchTerm = mainSearchInput.value.toLowerCase().trim();
            // Sync to mobile input if exists
            if (mobileSearchInput) {
                mobileSearchInput.value = mainSearchInput.value;
            }
        }
        
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        console.log('Searching for:', searchTerm, 'Category:', selectedCategory);
        
        // Use global variables from main.js
        if (typeof allPosts !== 'undefined' && typeof filteredPosts !== 'undefined') {
            filteredPosts = allPosts.filter(post => {
                const matchesSearch = !searchTerm || 
                    post.title.toLowerCase().includes(searchTerm) ||
                    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
                    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                    (post.categories && post.categories.some(cat => cat.toLowerCase().includes(searchTerm)));

                const matchesCategory = !selectedCategory || 
                    (post.categories && post.categories.includes(selectedCategory));

                return matchesSearch && matchesCategory;
            });
            
            console.log('Filtered posts:', filteredPosts.length);
            
            // Reset pagination
            if (typeof currentPage !== 'undefined') {
                currentPage = 1;
            }
            
            // Re-render results
            if (typeof renderPosts === 'function') renderPosts();
            if (typeof renderPagination === 'function') renderPagination();
            if (typeof updateResultsCount === 'function') updateResultsCount();
        } else {
            console.warn('Blog post variables not found, falling back to original search');
            if (typeof searchPosts === 'function') {
                searchPosts();
            }
        }
    }
    
    // Enhanced clear search function
    function enhancedClearSearch() {
        console.log('Enhanced clear search triggered');
        
        const mainSearchInput = document.getElementById('search-input');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        // Clear all inputs
        if (mainSearchInput) mainSearchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        
        // Use global variables from main.js
        if (typeof allPosts !== 'undefined' && typeof filteredPosts !== 'undefined') {
            filteredPosts = [...allPosts];
            if (typeof currentPage !== 'undefined') {
                currentPage = 1;
            }
            if (typeof renderPosts === 'function') renderPosts();
            if (typeof renderPagination === 'function') renderPagination();
            if (typeof updateResultsCount === 'function') updateResultsCount();
        } else {
            console.warn('Blog post variables not found, falling back to original clear');
            if (typeof clearSearch === 'function') {
                clearSearch();
            }
        }
    }
    
    // Initialize mobile search functionality
    function initializeMobileSearch() {
        if (mobileSearchInitialized) {
            console.log('Mobile search already initialized');
            return;
        }
        
        console.log('Initializing mobile search...');
        
        const mobileBtn = document.getElementById('mobile-search-button');
        const mobileInput = document.getElementById('mobile-search-input');
        
        if (mobileBtn && mobileInput) {
            console.log('Mobile search elements found, setting up event listeners...');
            
            // Remove any existing event listeners to prevent duplicates
            mobileBtn.removeEventListener('click', handleMobileSearchClick);
            mobileInput.removeEventListener('keypress', handleMobileSearchKeypress);
            mobileInput.removeEventListener('input', handleMobileSearchInput);
            
            // Add event listeners
            mobileBtn.addEventListener('click', handleMobileSearchClick, { passive: false });
            mobileInput.addEventListener('keypress', handleMobileSearchKeypress, { passive: false });
            mobileInput.addEventListener('input', handleMobileSearchInput, { passive: true });
            
            // Fix Chrome mobile focus issues
            mobileInput.addEventListener('focus', function() {
                console.log('Mobile input focused');
                // Ensure input is properly visible on Chrome mobile
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });
            
            mobileSearchInitialized = true;
            console.log('Mobile search initialization complete');
        } else {
            console.log('Mobile search elements not found yet');
        }
    }
    
    // Mobile search button click handler
    function handleMobileSearchClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile search button clicked');
        enhancedSearchPosts();
    }
    
    // Mobile search input keypress handler
    function handleMobileSearchKeypress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile search Enter pressed');
            enhancedSearchPosts();
        }
    }
    
    // Mobile search input change handler (for real-time sync)
    function handleMobileSearchInput(e) {
        // Sync with main search input if it exists
        const mainSearchInput = document.getElementById('search-input');
        if (mainSearchInput && e.target.value !== mainSearchInput.value) {
            mainSearchInput.value = e.target.value;
        }
    }
    
    // Initialize main search functionality
    function initializeMainSearch() {
        console.log('Initializing main search...');
        
        const mainSearchInput = document.getElementById('search-input');
        const mainSearchBtn = document.querySelector('button[onclick="searchPosts()"]');
        const clearBtn = document.querySelector('button[onclick="clearSearch()"]');
        
        if (mainSearchInput) {
            console.log('Main search input found');
            
            // Remove existing listeners to prevent duplicates
            mainSearchInput.removeEventListener('keypress', handleMainSearchKeypress);
            mainSearchInput.removeEventListener('input', handleMainSearchInput);
            
            // Add event listeners
            mainSearchInput.addEventListener('keypress', handleMainSearchKeypress, { passive: false });
            mainSearchInput.addEventListener('input', handleMainSearchInput, { passive: true });
        }
        
        // Override button onclick events if they exist
        if (mainSearchBtn) {
            mainSearchBtn.removeAttribute('onclick');
            mainSearchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                enhancedSearchPosts();
            });
        }
        
        if (clearBtn) {
            clearBtn.removeAttribute('onclick');
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                enhancedClearSearch();
            });
        }
    }
    
    // Main search input keypress handler
    function handleMainSearchKeypress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Main search Enter pressed');
            enhancedSearchPosts();
        }
    }
    
    // Main search input change handler (for real-time sync)
    function handleMainSearchInput(e) {
        // Sync with mobile search input if it exists
        const mobileSearchInput = document.getElementById('mobile-search-input');
        if (mobileSearchInput && e.target.value !== mobileSearchInput.value) {
            mobileSearchInput.value = e.target.value;
        }
    }
    
    // Initialize everything
    function initializeSearchSync() {
        if (isInitialized) {
            console.log('Search sync already initialized');
            return;
        }
        
        console.log('Starting search sync initialization...');
        
        // Initialize main search
        initializeMainSearch();
        
        // Initialize mobile search
        initializeMobileSearch();
        
        // Override global search functions if they exist
        if (typeof window.searchPosts !== 'undefined') {
            console.log('Overriding global searchPosts function');
            window.searchPosts = enhancedSearchPosts;
        }
        
        if (typeof window.clearSearch !== 'undefined') {
            console.log('Overriding global clearSearch function');
            window.clearSearch = enhancedClearSearch;
        }
        
        // Make functions globally available
        window.enhancedSearchPosts = enhancedSearchPosts;
        window.enhancedClearSearch = enhancedClearSearch;
        
        isInitialized = true;
        console.log('Search sync initialization complete');
    }
    
    // Try to initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing search sync...');
            // Wait a bit for other scripts to load
            setTimeout(initializeSearchSync, 500);
        });
    } else {
        console.log('DOM already loaded, initializing search sync...');
        setTimeout(initializeSearchSync, 100);
    }
    
    // Also try to initialize when partials are loaded
    // Listen for custom events if main.js dispatches them
    document.addEventListener('partialsLoaded', function() {
        console.log('Partials loaded event detected');
        setTimeout(initializeMobileSearch, 200);
    });
    
    // Fallback: try to initialize periodically until successful
    let initAttempts = 0;
    const maxInitAttempts = 20;
    
    function attemptInitialization() {
        initAttempts++;
        
        if (!mobileSearchInitialized) {
            initializeMobileSearch();
        }
        
        if (initAttempts < maxInitAttempts && !mobileSearchInitialized) {
            setTimeout(attemptInitialization, 500);
        }
    }
    
    // Start fallback initialization attempts
    setTimeout(attemptInitialization, 1000);
    
})();
/**
 * Search Enhancement and Cross-Browser Compatibility
 * Enhanced search untuk desktop dengan cross-browser support
 * Mobile navbar search dah dibuang untuk cleaner UX
 */

(function() {
    'use strict';
    
    let isInitialized = false;
    
    // Enhanced search function untuk desktop search
    function enhancedSearchPosts() {
        console.log('Enhanced search triggered');
        
        // Get values from main search input
        const mainSearchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        let searchTerm = '';
        
        if (mainSearchInput) {
            searchTerm = mainSearchInput.value.toLowerCase().trim();
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
        const categoryFilter = document.getElementById('category-filter');
        
        // Clear inputs
        if (mainSearchInput) mainSearchInput.value = '';
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
    
    // Main search input change handler
    function handleMainSearchInput(e) {
        // Could add real-time search here if needed
        // For now, just log the input change
        console.log('Main search input changed:', e.target.value);
    }
    
    // Initialize everything
    function initializeSearchEnhancement() {
        if (isInitialized) {
            console.log('Search enhancement already initialized');
            return;
        }
        
        console.log('Starting search enhancement initialization...');
        
        // Initialize main search
        initializeMainSearch();
        
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
        console.log('Search enhancement initialization complete');
    }
    
    // Try to initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing search enhancement...');
            // Wait a bit for other scripts to load
            setTimeout(initializeSearchEnhancement, 500);
        });
    } else {
        console.log('DOM already loaded, initializing search enhancement...');
        setTimeout(initializeSearchEnhancement, 100);
    }
    
})();
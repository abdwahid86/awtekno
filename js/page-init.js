// Common page initialization script
// This ensures theme toggle works on ALL pages

async function initializePage(pageSpecificInit) {
    try {
        console.log('Starting page initialization...');
        
        // Load partials first
        await loadPartials();
        
        // Load head and analytics
        if (typeof loadHead === 'function') loadHead();
        if (typeof loadAnalytics === 'function') loadAnalytics();
        
        // Initialize theme AFTER partials are loaded
        // Small delay to ensure DOM elements are ready
        setTimeout(() => {
            if (typeof initTheme === 'function') {
                console.log('Initializing theme...');
                initTheme();
            }
        }, 100);
        
        // Run page-specific initialization if provided
        if (pageSpecificInit && typeof pageSpecificInit === 'function') {
            await pageSpecificInit();
        }
        
        console.log('Page initialization complete!');
        
    } catch (error) {
        console.error('Error during page initialization:', error);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if page has specific init function, otherwise just basic init
        if (typeof pageInit === 'function') {
            initializePage(pageInit);
        } else {
            initializePage();
        }
    });
} else {
    if (typeof pageInit === 'function') {
        initializePage(pageInit);
    } else {
        initializePage();
    }
}

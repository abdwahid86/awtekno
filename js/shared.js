// Existing loadPartials() and renderMarkdown() ...

async function loadHead() {
    const headContent = await fetch('partials/head.html').then(r => r.text());
    document.getElementById('head-placeholder').innerHTML = headContent;

    // Set dynamic SEO meta tags berdasarkan page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let title = 'awtekno.com - Perkongsian Teknologi';
    let description = 'Blog teknologi dengan tips, affiliate products, dan komuniti percuma.';
    let url = window.location.origin + '/' + currentPage;

    // Customize per page (contoh: load dari JSON kalau nak lebih dynamic)
    if (currentPage === 'shop.html') {
        title = 'Kedai Affiliate - awtekno.com';
        description = 'Senarai produk affiliate dari TikTok dan lain-lain untuk teknologi.';
    } else if (currentPage === 'services.html') {
        title = 'Servis Affiliate - awtekno.com';
        description = 'Servis cloud dan tools teknologi dengan affiliate links – RunCloud, Digital Ocean, dll.';
    } else if (currentPage === 'komuniti.html') {
        title = 'Komuniti - awtekno.com';
        description = 'Rakan-rakan, blog, dan platform yang kami sokong - komuniti teknologi Malaysia.';
    } else if (currentPage === 'about.html') {
        title = 'Hubungi - awtekno.com';
        description = 'Hubungi awtekno.com untuk soalan teknikal, feedback blog, kerjasama business atau cadangan content.';
    }

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
}

// Make sure to initialize theme and load partials after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof initTheme === 'function') {
        initTheme();
    }
    await loadHead();
});

async function loadAnalytics() {
    const analyticsContent = await fetch('partials/analytics.html').then(r => r.text());
    document.getElementById('analytics-placeholder').innerHTML = analyticsContent;
}

/* Theme toggle helpers */
function getStoredTheme() {
    try {
        return localStorage.getItem('theme');
    } catch (e) {
        console.error('LocalStorage error:', e);
        return null;
    }
}

function setTheme(theme) {
    console.log('Setting theme to:', theme);
    const html = document.documentElement;
    const isDark = theme === 'dark';
    
    if (isDark) {
        html.classList.add('theme-dark');
        document.body.classList.add('bg-dark');
    } else {
        html.classList.remove('theme-dark');
        document.body.classList.remove('bg-dark');
    }

    // Update both desktop and mobile theme icons
    ['theme-toggle-icon', 'theme-toggle-icon-mobile'].forEach(id => {
        const icon = document.getElementById(id);
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    });

    // Update aria attributes for both buttons
    ['theme-toggle', 'theme-toggle-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.setAttribute('aria-pressed', isDark.toString());
            btn.setAttribute('aria-label', isDark ? 'Tukar ke Light Mode' : 'Tukar ke Dark Mode');
        }
    });

    try { 
        localStorage.setItem('theme', theme); 
    } catch (e) {
        console.error('Cannot save theme preference:', e);
    }
}

function toggleTheme() {
    console.log('Toggle theme called');
    const current = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    console.log('Switching from', current, 'to', next);
    setTheme(next);
}

function initTheme() {
    console.log('initTheme called');
    
    // Set initial theme
    const stored = getStoredTheme();
    if (stored) {
        console.log('Using stored theme:', stored);
        setTheme(stored);
    } else {
        // Default to light theme if no preference stored
        console.log('No stored theme, defaulting to light');
        setTheme('light');
    }
    
    // Bind toggle buttons for both desktop and mobile
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        const desktopBtn = document.getElementById('theme-toggle');
        const mobileBtn = document.getElementById('theme-toggle-mobile');
        
        console.log('Looking for theme buttons...');
        console.log('Desktop button:', desktopBtn);
        console.log('Mobile button:', mobileBtn);
        
        if (desktopBtn) {
            desktopBtn.removeEventListener('click', toggleTheme); // Remove any existing
            desktopBtn.addEventListener('click', toggleTheme);
            console.log('Desktop theme toggle attached');
        }
        
        if (mobileBtn) {
            mobileBtn.removeEventListener('click', toggleTheme); // Remove any existing
            mobileBtn.addEventListener('click', toggleTheme);
            console.log('Mobile theme toggle attached');
        }
        
        // Update button states
        const isDark = document.documentElement.classList.contains('theme-dark');
        [desktopBtn, mobileBtn].forEach(btn => {
            if (btn) {
                btn.setAttribute('aria-pressed', isDark.toString());
            }
        });
    }, 100);
}

// Make functions globally available
window.initTheme = initTheme;
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
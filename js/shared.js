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
        title = 'Siapa Saya - awtekno.com';
        description = 'Pengenalan diri: Developer teknologi dengan tips dan affiliate.';
    }

    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:url"]').setAttribute('content', url);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
    document.querySelector('link[rel="canonical"]').setAttribute('href', url);
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
        return null;
    }
}

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.classList.add('theme-dark');
        document.getElementById && document.getElementById('theme-toggle-icon') && (document.getElementById('theme-toggle-icon').textContent = '🌙');
    } else {
        html.classList.remove('theme-dark');
        document.getElementById && document.getElementById('theme-toggle-icon') && (document.getElementById('theme-toggle-icon').textContent = '☀️');
    }
    try { localStorage.setItem('theme', theme); } catch (e) {}
}

function toggleTheme() {
    const current = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}

function initTheme() {
    const stored = getStoredTheme();
    if (stored) {
        setTheme(stored);
        return;
    }
    // Respect OS preference if no stored value
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = mq ? mq.matches : false;
    setTheme(prefersDark ? 'dark' : 'light');
    // If user hasn't chosen, update when OS preference changes
    if (mq) {
        mq.addEventListener ? mq.addEventListener('change', e => {
            // only auto-change when no explicit stored preference
            if (!getStoredTheme()) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        }) : mq.addListener && mq.addListener(e => {
            if (!getStoredTheme()) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    // Bind toggle button
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', toggleTheme);
        btn.setAttribute('aria-pressed', document.documentElement.classList.contains('theme-dark'));
    }
}

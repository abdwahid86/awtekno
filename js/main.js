// Global variables
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 6;

// Variables untuk affiliate pages
let allShopItems = [];
let filteredShopItems = [];
let allServiceItems = [];
let filteredServiceItems = [];
let allResourceItems = [];
let filteredResourceItems = [];
let currentShopPage = 1;
let currentServicePage = 1;
let currentResourcePage = 1;
const itemsPerPage = 6;

// Store current post for sharing
let currentPost = null;

async function loadPartials() {
    try {
        const [header, nav, footer] = await Promise.all([
            fetch('partials/header.html').then(r => r.text()),
            fetch('partials/nav.html').then(r => r.text()),
            fetch('partials/footer.html').then(r => r.text())
        ]);
        
        document.getElementById('header').innerHTML = header;
        document.getElementById('nav').innerHTML = nav;
        document.getElementById('footer').innerHTML = footer;
        
        // Dark theme is our brand - no toggle needed!
    } catch (error) {
        console.error('Error loading partials:', error);
    }
}

function renderMarkdown(text) {
    if (!text || text.trim() === '') {
        console.warn('renderMarkdown: Input text is empty or null.');
        return '<p><em>No content available.</em></p>';
    }

    if (typeof marked !== 'undefined') {
        try {
            return marked.parse(text);
        } catch (error) {
            console.error('Error in marked.js:', error);
            return '<p><em>Error rendering Markdown content.</em></p>';
        }
    } else {
        console.warn('Marked.js is not available. Falling back to basic rendering.');
        return text
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}

// ===============================
// BLOG POSTS FUNCTIONS (Main Page)
// ===============================

async function loadPosts() {
    try {
        console.log('Loading posts...');
        const response = await fetch('data/posts.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allPosts = await response.json();
        console.log('Posts loaded:', allPosts.length);

        filteredPosts = [...allPosts];

        await renderPosts();
        renderCategories();
        renderPagination();
        updateResultsCount();

        console.log('Posts rendering complete');
    } catch (error) {
        console.error('Error loading posts:', error);
        const list = document.getElementById('posts-list');
        if (list) {
            list.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error loading posts. Please check console.</p></div>';
        }
    }
}

async function renderPosts() {
    const list = document.getElementById('posts-list');
    if (!list) {
        console.error('posts-list element not found');
        return;
    }
    
    console.log('Rendering posts...');
    list.innerHTML = '';
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    console.log(`Showing posts ${startIndex} to ${endIndex}, total: ${filteredPosts.length}`);
    
    if (postsToShow.length === 0) {
        list.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tiada post dijumpai.</p></div>';
        return;
    }
    
    postsToShow.forEach((post, index) => {
        console.log(`Creating card for post: ${post.title}`);
        
        const card = document.createElement('div');
        card.className = 'col';
        
        const safeTitle = escapeHtml(post.title);
        const safeExcerpt = escapeHtml(post.excerpt);
        const safeCategories = post.categories ? post.categories.map(cat => escapeHtml(cat)).join(', ') : '';
        const safeTags = post.tags ? post.tags.map(tag => escapeHtml(tag)).join(', ') : '';
        
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <div role="heading" aria-level="7" class="card-title small-heading">${safeTitle}</div>
                    <p class="card-text text-muted small">
                        📅 ${post.date}
                        <br>📂 ${safeCategories}
                        ${safeTags ? `<br>🏷️ ${safeTags}` : ''}
                    </p>
                    <button class="btn btn-primary mt-auto read-more-btn" data-post-index="${startIndex + index}">
                        Baca Lanjut
                    </button>
                </div>
            </div>
        `;
        
        list.appendChild(card);
    });
    
    const buttons = list.querySelectorAll('.read-more-btn');
    console.log(`Found ${buttons.length} read-more buttons`);
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const postIndex = parseInt(this.dataset.postIndex);
            console.log('Button clicked for post index:', postIndex);
            
            if (postIndex >= 0 && postIndex < filteredPosts.length) {
                showPost(filteredPosts[postIndex]);
            } else {
                console.error('Invalid post index:', postIndex);
            }
        });
    });
}

function renderCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    // Flatten all categories arrays and get unique values
    const categories = [...new Set(allPosts.flatMap(post => post.categories))].sort();
    
    categoryFilter.innerHTML = `
        <option value="">Semua Kategori</option>
        ${categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('')}
    `;
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Sebelum</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Seterusnya</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
    
    pagination.querySelectorAll('a.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                renderPosts();
                renderPagination();
                updateResultsCount();
                
                document.getElementById('posts-list').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

async function showPost(post) {
    console.log('Showing post:', post.title);

    // store for sharing/copy link
    currentPost = post;

    try {
        const modalTitle = document.getElementById('post-modal-label');
        const postContent = document.getElementById('post-content');

        if (!modalTitle || !postContent) {
            console.error('Modal elements not found');
            return;
        }

        modalTitle.textContent = post.title;

        // set URL hash so post can be shared / linked
        try {
            // prefer slug in hash so links are readable and stable
            if (post.slug) {
                history.replaceState(null, '', `#post-${encodeURIComponent(post.slug)}`);
            } else {
                const index = allPosts.findIndex(p => p === post);
                if (index >= 0) history.replaceState(null, '', `#post-${index}`);
            }
        } catch (err) {
            console.warn('Unable to set post hash for sharing:', err);
        }

        // Fetch the content dynamically
        const response = await fetch(post.file);
        if (!response.ok) {
            throw new Error(`Failed to load post content: ${response.status}`);
        }
        const content = await response.text();

        if (!content || content.trim() === '') {
            console.warn('Post content is empty or minimal.');
        }

        postContent.innerHTML = post.format === 'markdown' ? renderMarkdown(content) : content;

        const modalElement = document.getElementById('post-modal');
        if (modalElement) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                document.body.classList.add('modal-open');

                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);

                console.log('Modal shown (fallback method)');
            }
        }
    } catch (error) {
        console.error('Error showing post:', error);
        alert('Error loading post content. Please check the console for details.');
    }
}

function searchPosts() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    if (!searchInput || !categoryFilter) {
        console.error('Search elements not found');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    
    console.log('Searching for:', searchTerm, 'Category:', selectedCategory);
    
    filteredPosts = allPosts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
            (post.categories && post.categories.some(cat => cat.toLowerCase().includes(searchTerm)));

        // If no category selected or post has the selected category
        const matchesCategory = !selectedCategory || 
            (post.categories && post.categories.includes(selectedCategory));

        return matchesSearch && matchesCategory;
    });
    
    console.log('Filtered posts:', filteredPosts.length);
    
    currentPage = 1;
    renderPosts();
    renderPagination();
    updateResultsCount();
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const total = filteredPosts.length;
        const showing = Math.min(postsPerPage, total - (currentPage - 1) * postsPerPage);
        const start = total > 0 ? (currentPage - 1) * postsPerPage + 1 : 0;
        const end = (currentPage - 1) * postsPerPage + showing;
        
        resultsCount.textContent = `Menunjukkan ${start}-${end} daripada ${total} post`;
    }
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    filteredPosts = [...allPosts];
    currentPage = 1;
    renderPosts();
    renderPagination();
    updateResultsCount();
}

// ===============================
// SHOP FUNCTIONS
// ===============================

async function loadAffiliates(type) {
    try {
        const file = `data/affiliates-${type}.json`;
        const response = await fetch(file);
        const items = await response.json();
        
        if (type === 'shop') {
            allShopItems = items.map((item, index) => ({ ...item, id: index }));
            filteredShopItems = [...allShopItems];
            renderShopItems();
            renderShopPagination();
            updateShopResultsCount();
        } else if (type === 'services') {
            allServiceItems = items.map((item, index) => ({ ...item, id: index }));
            filteredServiceItems = [...allServiceItems];
            renderServiceItems();
            renderServicePagination();
            updateServiceResultsCount();
        }
        
        console.log(`${type} items loaded:`, items.length);
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
    }
}

function renderShopItems() {
    const container = document.getElementById('shop-products');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startIndex = (currentShopPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredShopItems.slice(startIndex, endIndex);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tiada produk dijumpai.</p></div>';
        return;
    }
    
    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100">
                <img src="${item.image_url}" class="card-img-top" alt="${escapeHtml(item.name)}" loading="lazy" style="width: 100%; max-height: 250px; object-fit: contain; background: #2d2d2d;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(item.name)}</h5>
                    <p class="card-text flex-grow-1">${escapeHtml(item.description)}</p>
                    <a href="${item.link}" target="_blank" class="btn btn-primary mt-auto">Beli Sekarang</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function searchShopItems() {
    const searchInput = document.getElementById('shop-search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredShopItems = allShopItems.filter(item => {
        return !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);
    });
    
    currentShopPage = 1;
    renderShopItems();
    renderShopPagination();
    updateShopResultsCount();
}

function clearShopSearch() {
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';
    
    filteredShopItems = [...allShopItems];
    currentShopPage = 1;
    renderShopItems();
    renderShopPagination();
    updateShopResultsCount();
}

function renderShopPagination() {
    const pagination = document.getElementById('shop-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredShopItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    paginationHTML += `
        <li class="page-item ${currentShopPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeShopPage(${currentShopPage - 1})">Sebelum</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentShopPage - 2 && i <= currentShopPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentShopPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeShopPage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentShopPage - 3 || i === currentShopPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    paginationHTML += `
        <li class="page-item ${currentShopPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeShopPage(${currentShopPage + 1})">Seterusnya</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
}

function changeShopPage(page) {
    const totalPages = Math.ceil(filteredShopItems.length / itemsPerPage);
    if (page >= 1 && page <= totalPages && page !== currentShopPage) {
        currentShopPage = page;
        renderShopItems();
        renderShopPagination();
        updateShopResultsCount();
        document.getElementById('shop-products').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateShopResultsCount() {
    const resultsCount = document.getElementById('shop-results-count');
    if (resultsCount) {
        const total = filteredShopItems.length;
        const showing = Math.min(itemsPerPage, total - (currentShopPage - 1) * itemsPerPage);
        const start = total > 0 ? (currentShopPage - 1) * itemsPerPage + 1 : 0;
        const end = (currentShopPage - 1) * itemsPerPage + showing;
        
        resultsCount.textContent = `Menunjukkan ${start}-${end} daripada ${total} produk`;
    }
}

// ===============================
// SERVICES FUNCTIONS
// ===============================

function renderServiceItems() {
    const container = document.getElementById('services-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startIndex = (currentServicePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredServiceItems.slice(startIndex, endIndex);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tiada servis dijumpai.</p></div>';
        return;
    }
    
    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title">${escapeHtml(item.name)}</h3>
                    <p class="card-text flex-grow-1">${escapeHtml(item.description)}</p>
                    <a href="${item.link}" target="_blank" class="btn btn-success mt-auto">Lawati</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function searchServiceItems() {
    const searchInput = document.getElementById('service-search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredServiceItems = allServiceItems.filter(item => {
        return !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);
    });
    
    currentServicePage = 1;
    renderServiceItems();
    renderServicePagination();
    updateServiceResultsCount();
}

function clearServiceSearch() {
    const searchInput = document.getElementById('service-search-input');
    if (searchInput) searchInput.value = '';
    
    filteredServiceItems = [...allServiceItems];
    currentServicePage = 1;
    renderServiceItems();
    renderServicePagination();
    updateServiceResultsCount();
}

function renderServicePagination() {
    const pagination = document.getElementById('service-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredServiceItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    paginationHTML += `
        <li class="page-item ${currentServicePage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeServicePage(${currentServicePage - 1})">Sebelum</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentServicePage - 2 && i <= currentServicePage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentServicePage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeServicePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentServicePage - 3 || i === currentServicePage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    paginationHTML += `
        <li class="page-item ${currentServicePage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeServicePage(${currentServicePage + 1})">Seterusnya</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
}

function changeServicePage(page) {
    const totalPages = Math.ceil(filteredServiceItems.length / itemsPerPage);
    if (page >= 1 && page <= totalPages && page !== currentServicePage) {
        currentServicePage = page;
        renderServiceItems();
        renderServicePagination();
        updateServiceResultsCount();
        document.getElementById('services-list').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateServiceResultsCount() {
    const resultsCount = document.getElementById('service-results-count');
    if (resultsCount) {
        const total = filteredServiceItems.length;
        const showing = Math.min(itemsPerPage, total - (currentServicePage - 1) * itemsPerPage);
        const start = total > 0 ? (currentServicePage - 1) * itemsPerPage + 1 : 0;
        const end = (currentServicePage - 1) * itemsPerPage + showing;
        
        resultsCount.textContent = `Menunjukkan ${start}-${end} daripada ${total} servis`;
    }
}

// ===============================
// RESOURCES FUNCTIONS
// ===============================

async function loadResources() {
    try {
        const response = await fetch('data/komuniti.json');
        const resources = await response.json();
        allResourceItems = resources.map((item, index) => ({ ...item, id: index }));
        filteredResourceItems = [...allResourceItems];
        renderResourceItems();
        renderResourcePagination();
        updateResourceResultsCount();
        console.log('Komuniti platform loaded:', resources.length);
    } catch (error) {
        console.error('Error loading komuniti platform:', error);
    }
}

function renderResourceItems() {
    const container = document.getElementById('resources-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startIndex = (currentResourcePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredResourceItems.slice(startIndex, endIndex);
    
    if (itemsToShow.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tiada platform dijumpai.</p></div>';
        return;
    }
    
    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(item.name)}</h5>
                    <p class="card-text flex-grow-1">${escapeHtml(item.description)}</p>
                    <a href="${item.link}" target="_blank" class="btn btn-primary mt-auto">Lawati</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function searchResourceItems() {
    const searchInput = document.getElementById('resource-search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredResourceItems = allResourceItems.filter(item => {
        return !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);
    });
    
    currentResourcePage = 1;
    renderResourceItems();
    renderResourcePagination();
    updateResourceResultsCount();
}

function clearResourceSearch() {
    const searchInput = document.getElementById('resource-search-input');
    if (searchInput) searchInput.value = '';
    
    filteredResourceItems = [...allResourceItems];
    currentResourcePage = 1;
    renderResourceItems();
    renderResourcePagination();
    updateResourceResultsCount();
}

function renderResourcePagination() {
    const pagination = document.getElementById('resource-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredResourceItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    paginationHTML += `
        <li class="page-item ${currentResourcePage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeResourcePage(${currentResourcePage - 1})">Sebelum</a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentResourcePage - 2 && i <= currentResourcePage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentResourcePage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeResourcePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentResourcePage - 3 || i === currentResourcePage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    paginationHTML += `
        <li class="page-item ${currentResourcePage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeResourcePage(${currentResourcePage + 1})">Seterusnya</a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    pagination.innerHTML = paginationHTML;
}

function changeResourcePage(page) {
    const totalPages = Math.ceil(filteredResourceItems.length / itemsPerPage);
    if (page >= 1 && page <= totalPages && page !== currentResourcePage) {
        currentResourcePage = page;
        renderResourceItems();
        renderResourcePagination();
        updateResourceResultsCount();
        document.getElementById('resources-list').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateResourceResultsCount() {
    const resultsCount = document.getElementById('resource-results-count');
    if (resultsCount) {
        const total = filteredResourceItems.length;
        const showing = Math.min(itemsPerPage, total - (currentResourcePage - 1) * itemsPerPage);
        const start = total > 0 ? (currentResourcePage - 1) * itemsPerPage + 1 : 0;
        const end = (currentResourcePage - 1) * itemsPerPage + showing;
        
        resultsCount.textContent = `Menunjukkan ${start}-${end} daripada ${total} platform`;
    }
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadAbout() {
    try {
        const response = await fetch('data/about.md');
        const md = await response.text();
        const aboutContent = document.getElementById('about-content');
        if (aboutContent) {
            aboutContent.innerHTML = renderMarkdown(md);
        }
    } catch (error) {
        console.error('Error loading about:', error);
    }
}

// ===============================
// HASH-BASED POST SHARING SYSTEM
// ===============================

// Check for post hash on page load
function checkForPostHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#post-')) {
        const raw = hash.replace('#post-', '');
        let postId = raw;
        try {
            postId = decodeURIComponent(raw);
        } catch (e) {
            // ignore decode errors
        }

        // try slug match first
        const bySlug = allPosts.find(p => p.slug === postId);
        if (bySlug) {
            setTimeout(() => showPost(bySlug), 500);
            return;
        }

        // fallback: numeric index
        const index = parseInt(postId);
        if (!Number.isNaN(index) && index >= 0 && index < allPosts.length) {
            setTimeout(() => showPost(allPosts[index]), 500);
        }
    }
}

// Share post function
function sharePost() {
    if (!currentPost) return;
    
    const postUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    const postTitle = currentPost.title;
    const postText = `Check out this post: ${postTitle}`;
    
    if (navigator.share) {
        // Native sharing API (mobile)
        navigator.share({
            title: postTitle,
            text: postText,
            url: postUrl
        }).catch(error => {
            console.log('Share cancelled:', error);
        });
    } else {
        // Fallback for desktop
        copyPostLink();
    }
}

// Copy post link to clipboard
function copyPostLink() {
    const postUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Post link copied to clipboard!');
        }).catch(err => {
            // Fallback method
            fallbackCopyTextToClipboard(postUrl);
        });
    } else {
        // Fallback method
        fallbackCopyTextToClipboard(postUrl);
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Post link copied to clipboard!');
    } catch (err) {
        alert('Could not copy link. Please copy manually from address bar.');
    }
    
    document.body.removeChild(textArea);
}

// Initialize hash detection when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for posts to load, then check hash
    setTimeout(checkForPostHash, 1000);
});

// Handle browser back/forward with hash changes
window.addEventListener('hashchange', function() {
    checkForPostHash();
});
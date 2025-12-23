/**
 * GUN-YEAL LEE - Personal Website
 * Main JavaScript
 */

// =========================================
// MOBILE MENU TOGGLE
// =========================================
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const icon = document.getElementById('menu-icon');

    if (!menu || !icon) return;

    menu.classList.toggle('active');

    // Toggle icon between bars and X
    if (menu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}

// =========================================
// NEWS TOGGLE FUNCTIONALITY
// =========================================
let newsExpanded = false;

function initNewsToggle() {
    // Mark initially hidden cards
    document.querySelectorAll('.news-card.hidden').forEach(card => {
        card.dataset.collapsible = 'true';
    });
}

function toggleNews() {
    const collapsibleCards = document.querySelectorAll('.news-card[data-collapsible="true"]');
    const button = document.getElementById('news-toggle-btn');

    if (!button) return;

    newsExpanded = !newsExpanded;

    collapsibleCards.forEach(card => {
        if (newsExpanded) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
            card.classList.add('hidden');
        }
    });

    button.innerHTML = newsExpanded
        ? '<i class="fas fa-chevron-up"></i> Show Less'
        : '<i class="fas fa-chevron-down"></i> Show More';
}

// =========================================
// PUBLICATIONS SEARCH/FILTER
// =========================================
function initSearch() {
    const searchBox = document.getElementById('search-box');
    if (!searchBox) return;

    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterPublications(query);
    });
}

function filterPublications(query) {
    const cards = document.querySelectorAll('.publication-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.dataset.title || '';
        const authors = card.dataset.authors || '';
        const journal = card.dataset.journal || '';
        const year = card.dataset.year || '';

        const searchText = `${title} ${authors} ${journal} ${year}`.toLowerCase();

        if (query === '' || searchText.includes(query)) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease forwards';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update result count if element exists
    const resultCount = document.getElementById('result-count');
    if (resultCount) {
        resultCount.textContent = `Showing ${visibleCount} publication${visibleCount !== 1 ? 's' : ''}`;
    }
}

// =========================================
// LOAD DATA FROM JSON
// =========================================
async function loadNews() {
    try {
        const response = await fetch('data/news.json');
        const data = await response.json();
        return data.news;
    } catch (error) {
        console.error('Error loading news:', error);
        return [];
    }
}

async function loadPublications() {
    try {
        const response = await fetch('data/publications.json');
        const data = await response.json();
        return data.publications;
    } catch (error) {
        console.error('Error loading publications:', error);
        return [];
    }
}

// =========================================
// RENDER NEWS
// =========================================
function renderNews(newsItems, container, showCount = 3) {
    if (!container) return;

    container.innerHTML = newsItems.map((item, index) => `
        <div class="news-card${index >= showCount ? ' hidden' : ''}" ${index >= showCount ? 'data-collapsible="true"' : ''}>
            <div class="news-date">${item.date}</div>
            <div class="news-text">${item.text}</div>
        </div>
    `).join('');
}

// =========================================
// RENDER PUBLICATIONS
// =========================================
function highlightAuthor(authors, name = 'Gun-Yeal Lee') {
    // Handle different variations of the name
    return authors
        .replace(/Gun-Yeal Lee†/g, '<u><strong>Gun-Yeal Lee†</strong></u>')
        .replace(/Gun-Yeal Lee/g, '<u><strong>Gun-Yeal Lee</strong></u>');
}

function renderPublications(publications, container, featuredOnly = false) {
    if (!container) return;

    const items = featuredOnly
        ? publications.filter(pub => pub.featured)
        : publications;

    container.innerHTML = items.map(pub => {
        const hasImage = pub.image && pub.image !== null;
        const imageHtml = hasImage
            ? `<div class="pub-image-container">
                   <img src="${pub.image}" alt="${pub.title}" class="pub-image">
                   <div class="pub-image-overlay"></div>
               </div>`
            : `<div class="pub-image-container">
                   <div class="pub-image pub-image-placeholder"></div>
               </div>`;

        // For featured publications: simple "Journal Year" format
        // For full publications list: include volume/issue details
        const venueText = featuredOnly
            ? `${pub.journal} ${pub.year}`
            : (pub.volume
                ? `${pub.journal} ${pub.volume}${pub.issue ? `(${pub.issue})` : ''}, ${pub.year}`
                : `${pub.journal}, ${pub.year}`);

        let links = `<a href="${pub.link}" target="_blank">Paper</a>`;
        if (pub.projectPage) links += `<a href="${pub.projectPage}" target="_blank">Project</a>`;
        if (pub.news) links += `<a href="${pub.news}" target="_blank">News</a>`;
        if (pub.notes) links += `<span class="pub-note">${pub.notes}</span>`;

        return `
            <article class="publication-card" 
                     data-title="${pub.title.toLowerCase()}"
                     data-authors="${pub.authors.toLowerCase()}"
                     data-journal="${pub.journal.toLowerCase()}"
                     data-year="${pub.year}">
                ${imageHtml}
                <div class="pub-info">
                    <h3>${pub.title}</h3>
                    <p class="pub-authors">${highlightAuthor(pub.authors)}</p>
                    <p class="pub-venue">${venueText}</p>
                    <div class="pub-links">${links}</div>
                </div>
            </article>
        `;
    }).join('');
}

// =========================================
// ACTIVE NAV LINK
// =========================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Set active nav link
    setActiveNavLink();

    // Initialize news toggle
    initNewsToggle();

    // Initialize search
    initSearch();

    // Load and render news (home page only)
    const newsContainer = document.getElementById('news-grid');
    if (newsContainer) {
        const news = await loadNews();
        renderNews(news, newsContainer, 3);
        initNewsToggle(); // Re-init after rendering
    }

    // Load and render featured publications (home page)
    const featuredPubsContainer = document.getElementById('featured-publications');
    if (featuredPubsContainer) {
        const publications = await loadPublications();
        renderPublications(publications, featuredPubsContainer, true);
    }

    // Load and render all publications (publications page)
    const allPubsContainer = document.getElementById('all-publications');
    if (allPubsContainer) {
        const publications = await loadPublications();
        renderPublications(publications, allPubsContainer, false);

        // Update count
        const resultCount = document.getElementById('result-count');
        if (resultCount) {
            resultCount.textContent = `Showing ${publications.length} publications`;
        }
    }
});

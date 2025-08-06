// components/header.js
export const headerHTML = `
<header class="header">
    <nav class="navbar">
        <a href="/" class="logo">MyDigipal</a>
        
        <ul class="nav-menu">
            <li class="nav-dropdown">
                <a href="#" class="nav-link dropdown-trigger">B2B Marketing <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/abm" class="dropdown-link">ABM</a></li>
                    <li><a href="/campaign-management" class="dropdown-link">Campaign Management</a></li>
                    <li><a href="/marketing-automation" class="dropdown-link">Marketing Automation</a></li>
                    <li><a href="/marketing-strategy" class="dropdown-link">Marketing Strategy</a></li>
                    <li><a href="/abm-training" class="dropdown-link">ABM Training</a></li>
                </ul>
            </li>
            
            <li class="nav-dropdown">
                <a href="#" class="nav-link dropdown-trigger">Services <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/paid-social" class="dropdown-link">Paid Social</a></li>
                    <li><a href="/paid-search" class="dropdown-link">Paid Search</a></li>
                    <li><a href="/content-creation" class="dropdown-link">Content Creation</a></li>
                    <li><a href="/display" class="dropdown-link">Display</a></li>
                    <li><a href="/content-syndication" class="dropdown-link">Content Syndication</a></li>
                    <li><a href="/email-marketing" class="dropdown-link">Email Marketing</a></li>
                    <li><a href="/seo" class="dropdown-link">SEO</a></li>
                </ul>
            </li>
            
            <li class="nav-dropdown">
                <a href="#" class="nav-link dropdown-trigger">Training <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/training" class="dropdown-link">All Trainings</a></li>
                    <li><a href="/training/ai" class="dropdown-link">AI Training</a></li>
                    <li><a href="/training/abm" class="dropdown-link">ABM Training</a></li>
                </ul>
            </li>
            
            <li class="nav-dropdown">
                <a href="#" class="nav-link dropdown-trigger">Automotive <span class="dropdown-arrow">▼</span></a>
                <ul class="dropdown-menu">
                    <li><a href="/automotive/google-ads" class="dropdown-link">Google Ads</a></li>
                    <li><a href="/automotive/paid-social" class="dropdown-link">Paid Social</a></li>
                    <li><a href="/automotive/facebook-dynamic-ads" class="dropdown-link">Facebook Dynamic Ads</a></li>
                </ul>
            </li>
            
            <li><a href="/case-studies" class="nav-link">Case Studies</a></li>
            <li><a href="/our-team" class="nav-link">Our Team</a></li>
            <li><a href="/contact-us" class="nav-link">Contact</a></li>
        </ul>
        
        <button class="language-switcher" id="languageSwitcher">🇫🇷 FR</button>
        
        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </nav>
</header>
`;

export const headerCSS = `
/* Header Styles */
.header {
    background: var(--white);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.navbar {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.logo {
    font-size: 1.5rem;
    font-weight: var(--font-bold);
    color: var(--primary-blue);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.logo::before {
    content: "■";
    color: var(--secondary-purple);
    font-size: 1.2rem;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: var(--spacing-lg);
    align-items: center;
}

.nav-link {
    color: var(--dark-gray);
    text-decoration: none;
    font-weight: var(--font-medium);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 6px;
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.nav-link:hover {
    color: var(--primary-blue);
    background: var(--light-gray);
}

.nav-link.active {
    color: var(--primary-blue);
    background: var(--light-gray);
}

/* Dropdown Styles */
.nav-dropdown {
    position: relative;
}

.dropdown-arrow {
    font-size: 0.8rem;
    transition: var(--transition-fast);
}

.nav-dropdown:hover .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--white);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: var(--spacing-sm);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: var(--transition-medium);
    z-index: 1000;
    list-style: none;
}

.nav-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-link {
    display: block;
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--dark-gray);
    text-decoration: none;
    border-radius: 4px;
    transition: var(--transition-fast);
    font-weight: var(--font-regular);
}

.dropdown-link:hover {
    background: var(--light-gray);
    color: var(--primary-blue);
}

.language-switcher {
    background: var(--primary-blue);
    color: var(--white);
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 6px;
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: var(--transition-fast);
}

.language-switcher:hover {
    background: var(--secondary-purple);
}

/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
}

.mobile-menu-btn span {
    width: 25px;
    height: 3px;
    background: var(--dark-gray);
    border-radius: 2px;
    transition: var(--transition-fast);
}

.mobile-menu-btn:hover span {
    background: var(--primary-blue);
}

/* Mobile Responsive */
@media (max-width: 1024px) {
    .nav-menu {
        gap: var(--spacing-md);
    }
    
    .nav-link {
        padding: var(--spacing-xs);
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .nav-menu {
        display: none;
        position: absolute;
        top: 70px;
        left: 0;
        right: 0;
        background: var(--white);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        flex-direction: column;
        padding: var(--spacing-lg);
        gap: var(--spacing-md);
    }
    
    .nav-menu.active {
        display: flex;
    }
    
    .mobile-menu-btn {
        display: flex;
    }
    
    .dropdown-menu {
        position: static;
        box-shadow: none;
        background: var(--light-gray);
        margin-top: var(--spacing-xs);
        opacity: 1;
        visibility: visible;
        transform: none;
    }
    
    .nav-dropdown:hover .dropdown-menu {
        display: block;
    }
}
`;

// Function to load and initialize header
export function loadHeader() {
    // Insert header HTML
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }
    
    // Add header styles if not already present
    if (!document.getElementById('header-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'header-styles';
        styleElement.textContent = headerCSS;
        document.head.appendChild(styleElement);
    }
    
    // Initialize header functionality
    initializeHeader();
}

function initializeHeader() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Language switcher
    const languageSwitcher = document.getElementById('languageSwitcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', () => {
            switchLanguage();
        });
    }
    
    // Set active nav link based on current page
    setActiveNavLink();
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-trigger)');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath === href) {
            link.classList.add('active');
        } else if (href && currentPath.startsWith(href) && href !== '/') {
            link.classList.add('active');
        }
    });
}

function switchLanguage() {
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/fr/')) {
        // Switch to English
        const englishPath = currentPath.replace('/fr', '') || '/';
        window.location.href = englishPath;
    } else {
        // Switch to French
        if (currentPath === '/') {
            window.location.href = '/fr/';
        } else {
            window.location.href = '/fr' + currentPath;
        }
    }
}

// Export de la fonction initializeHeader
export { initializeHeader };

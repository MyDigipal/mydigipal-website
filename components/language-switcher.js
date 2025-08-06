// components/language-switcher.js

// Language configuration
const languageConfig = {
    en: {
        flag: '🇬🇧',
        name: 'EN',
        fullName: 'English',
        urlPrefix: ''
    },
    fr: {
        flag: '🇫🇷', 
        name: 'FR',
        fullName: 'Français',
        urlPrefix: '/fr'
    }
};

// Detect current language from URL
export function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    return currentPath.startsWith('/fr/') || currentPath === '/fr' ? 'fr' : 'en';
}

// Generate the opposite language info
export function getAlternateLanguage() {
    const currentLang = getCurrentLanguage();
    return currentLang === 'en' ? languageConfig.fr : languageConfig.en;
}

// Generate language switcher HTML
export const languageSwitcherHTML = `
<div class="language-switcher-container">
    <button class="language-switcher" id="languageSwitcher" title="Switch Language">
        <span class="lang-flag" id="langFlag"></span>
        <span class="lang-name" id="langName"></span>
    </button>
</div>
`;

export const languageSwitcherCSS = `
/* Language Switcher Styles */
.language-switcher-container {
    position: relative;
}

.language-switcher {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--primary-blue);
    color: var(--white);
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 6px;
    font-weight: var(--font-medium);
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition-fast);
    min-width: 60px;
    justify-content: center;
}

.language-switcher:hover {
    background: var(--secondary-purple);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.language-switcher:active {
    transform: translateY(0);
}

.lang-flag {
    font-size: 1rem;
    line-height: 1;
}

.lang-name {
    font-weight: var(--font-semibold);
    letter-spacing: 0.5px;
}

/* Language indicator for mobile */
@media (max-width: 768px) {
    .language-switcher {
        padding: var(--spacing-xs);
        min-width: 50px;
    }
    
    .lang-name {
        display: none;
    }
    
    .lang-flag {
        font-size: 1.2rem;
    }
}

/* Loading state */
.language-switcher.loading {
    opacity: 0.6;
    pointer-events: none;
}

.language-switcher.loading::after {
    content: "";
    width: 12px;
    height: 12px;
    border: 2px solid var(--white);
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-left: var(--spacing-xs);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Focus states for accessibility */
.language-switcher:focus {
    outline: 2px solid var(--white);
    outline-offset: 2px;
}

.language-switcher:focus:not(:focus-visible) {
    outline: none;
}
`;

// URL mapping for language switching
const urlMappings = {
    // Special cases for different URL structures
    '/': '/fr/',
    '/fr/': '/',
    '/fr': '/',
    
    // Standard page mappings
    '/our-team': '/fr/our-team',
    '/fr/our-team': '/our-team',
    '/contact-us': '/fr/contact-us',
    '/fr/contact-us': '/contact-us',
    '/case-studies': '/fr/case-studies',
    '/fr/case-studies': '/case-studies',
    
    // Services
    '/paid-social': '/fr/paid-social',
    '/fr/paid-social': '/paid-social',
    '/paid-search': '/fr/paid-search',
    '/fr/paid-search': '/paid-search',
    '/content-creation': '/fr/content-creation',
    '/fr/content-creation': '/content-creation',
    
    // B2B Marketing
    '/abm': '/fr/abm',
    '/fr/abm': '/abm',
    '/campaign-management': '/fr/campaign-management',
    '/fr/campaign-management': '/campaign-management',
    '/marketing-automation': '/fr/marketing-automation',
    '/fr/marketing-automation': '/marketing-automation',
    
    // Training
    '/training': '/fr/training',
    '/fr/training': '/training',
    '/training/ai': '/fr/training/ai',
    '/fr/training/ai': '/training/ai',
    '/training/abm': '/fr/training/abm',
    '/fr/training/abm': '/training/abm'
};

// Generate alternate URL
function getAlternateUrl(currentPath) {
    // Check if we have a specific mapping
    if (urlMappings[currentPath]) {
        return urlMappings[currentPath];
    }
    
    // Handle dynamic patterns
    if (currentPath.startsWith('/fr/')) {
        // Switch from French to English
        const englishPath = currentPath.replace('/fr', '') || '/';
        return englishPath;
    } else {
        // Switch from English to French
        if (currentPath === '/') {
            return '/fr/';
        } else {
            return '/fr' + currentPath;
        }
    }
}

// Main switch language function
export function switchLanguage() {
    const currentPath = window.location.pathname;
    const alternateUrl = getAlternateUrl(currentPath);
    
    // Add loading state
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.classList.add('loading');
    }
    
    // GTM tracking for language switches
    if (window.dataLayer) {
        const currentLang = getCurrentLanguage();
        const targetLang = currentLang === 'en' ? 'fr' : 'en';
        
        window.dataLayer.push({
            event: 'language_switch',
            from_language: currentLang,
            to_language: targetLang,
            from_url: currentPath,
            to_url: alternateUrl,
            timestamp: new Date().toISOString()
        });
    }
    
    // Navigate to alternate URL
    window.location.href = alternateUrl;
}

// Update switcher display based on current language
function updateLanguageSwitcherDisplay() {
    const alternateLang = getAlternateLanguage();
    const flagElement = document.getElementById('langFlag');
    const nameElement = document.getElementById('langName');
    
    if (flagElement && nameElement) {
        flagElement.textContent = alternateLang.flag;
        nameElement.textContent = alternateLang.name;
        
        // Update title attribute
        const switcher = document.getElementById('languageSwitcher');
        if (switcher) {
            switcher.title = `Switch to ${alternateLang.fullName}`;
        }
    }
}

// Add hreflang attributes to document head
function addHrefLangAttributes() {
    const currentPath = window.location.pathname;
    const currentLang = getCurrentLanguage();
    const alternateUrl = getAlternateUrl(currentPath);
    const alternateLang = currentLang === 'en' ? 'fr' : 'en';
    
    // Remove existing hreflang tags
    const existingHrefLangs = document.querySelectorAll('link[hreflang]');
    existingHrefLangs.forEach(link => link.remove());
    
    // Add hreflang for current page
    const currentHrefLang = document.createElement('link');
    currentHrefLang.rel = 'alternate';
    currentHrefLang.hreflang = currentLang;
    currentHrefLang.href = window.location.href;
    document.head.appendChild(currentHrefLang);
    
    // Add hreflang for alternate language
    const alternateHrefLang = document.createElement('link');
    alternateHrefLang.rel = 'alternate';
    alternateHrefLang.hreflang = alternateLang;
    alternateHrefLang.href = window.location.origin + alternateUrl;
    document.head.appendChild(alternateHrefLang);
    
    // Add x-default (usually points to English version)
    const defaultHrefLang = document.createElement('link');
    defaultHrefLang.rel = 'alternate';
    defaultHrefLang.hreflang = 'x-default';
    defaultHrefLang.href = window.location.origin + (currentLang === 'en' ? currentPath : getAlternateUrl(currentPath));
    document.head.appendChild(defaultHrefLang);
}

// Initialize language switcher
export function initializeLanguageSwitcher() {
    // Update display based on current language
    updateLanguageSwitcherDisplay();
    
    // Add hreflang attributes
    addHrefLangAttributes();
    
    // Add click event listener
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.addEventListener('click', switchLanguage);
    }
    
    // Keyboard accessibility
    if (switcher) {
        switcher.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchLanguage();
            }
        });
    }
}

// Load and initialize language switcher
export function loadLanguageSwitcher(containerId = 'language-switcher') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = languageSwitcherHTML;
    }
    
    // Add styles if not already present
    if (!document.getElementById('language-switcher-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'language-switcher-styles';
        styleElement.textContent = languageSwitcherCSS;
        document.head.appendChild(styleElement);
    }
    
    // Initialize functionality
    initializeLanguageSwitcher();
}

// Utility functions for other components to use
export function isCurrentLanguage(lang) {
    return getCurrentLanguage() === lang;
}

export function getLocalizedUrl(path, targetLang = null) {
    const lang = targetLang || getCurrentLanguage();
    if (lang === 'fr' && !path.startsWith('/fr')) {
        return path === '/' ? '/fr/' : '/fr' + path;
    } else if (lang === 'en' && path.startsWith('/fr')) {
        return path.replace('/fr', '') || '/';
    }
    return path;
}

// Auto-detect and redirect if needed (optional)
export function autoDetectLanguage() {
    // Only run on homepage
    if (window.location.pathname !== '/') {
        return;
    }
    
    // Check browser language preferences
    const browserLang = navigator.language || navigator.languages?.[0];
    const prefersFrench = browserLang?.startsWith('fr');
    
    // Check if user has a language preference stored
    const storedLang = localStorage.getItem('mydigipal-lang');
    
    if (storedLang === 'fr' || (!storedLang && prefersFrench)) {
        // Only redirect if we haven't redirected in this session
        const hasRedirected = sessionStorage.getItem('lang-redirected');
        if (!hasRedirected) {
            sessionStorage.setItem('lang-redirected', 'true');
            window.location.href = '/fr/';
        }
    }
}

// Store language preference
export function storeLanguagePreference(lang) {
    localStorage.setItem('mydigipal-lang', lang);
}

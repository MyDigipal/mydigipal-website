// js/app.js - Application principale MyDigipal

import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';
import { loadClientsCarousel } from '../components/clients-carousel.js';
import { loadLanguageSwitcher, initializeLanguageSwitcher, getCurrentLanguage, autoDetectLanguage } from '../components/language-switcher.js';
import { initGTM, getGTM, setupGlobalErrorTracking, trackCTAClick } from '../components/gtm.js';

// Configuration globale de l'application
const AppConfig = {
    gtmId: 'GTM-P4TSQ9Q',
    n8nWebhookUrl: null, // À configurer si besoin
    version: '2.0.0',
    environment: 'production',
    features: {
        autoLanguageDetect: true,
        animationsOnScroll: true,
        performanceMonitoring: true,
        analytics: true
    }
};

// Classe principale de l'application
class MyDigipalApp {
    constructor() {
        this.currentLanguage = getCurrentLanguage();
        this.isInitialized = false;
        this.components = new Map();
        this.observers = new Map();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handlePageLoad = this.handlePageLoad.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    // Initialisation principale
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🚀 Initializing MyDigipal App v' + AppConfig.version);
            
            // 1. Initialize core systems
            await this.initializeCore();
            
            // 2. Load components
            await this.loadComponents();
            
            // 3. Initialize features
            this.initializeFeatures();
            
            // 4. Setup event listeners
            this.setupEventListeners();
            
            // 5. Initialize analytics
            this.initializeAnalytics();
            
            this.isInitialized = true;
            console.log('✅ MyDigipal App initialized successfully');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('mydigipal:app-ready', {
                detail: { version: AppConfig.version }
            }));
            
        } catch (error) {
            console.error('❌ Failed to initialize MyDigipal App:', error);
            this.handleInitError(error);
        }
    }

    // Initialisation des systèmes de base
    async initializeCore() {
        // Détecter le type de page et si elle contient des formulaires
        const pageConfig = this.detectPageConfiguration();
        
        // Initialiser GTM avec la configuration détectée
        this.gtm = initGTM(pageConfig);
        
        // Auto-detect language if enabled
        if (AppConfig.features.autoLanguageDetect) {
            autoDetectLanguage();
        }
        
        // Set up global error handling
        this.setupErrorHandling();
        
        // Initialize performance monitoring
        if (AppConfig.features.performanceMonitoring) {
            this.initializePerformanceMonitoring();
        }
        
        // Setup global error tracking avec GTM
        setupGlobalErrorTracking();
    }
    
    // Détecter la configuration de la page
    detectPageConfiguration() {
        const path = window.location.pathname;
        const hasContactForm = document.querySelector('form[id*="contact"], form[onsubmit*="handleFormSubmit"]') !== null;
        const hasLeadForms = hasContactForm || 
                           path.includes('/contact') || 
                           path.includes('/training') ||
                           document.querySelector('form[data-lead-form="true"]') !== null;
        
        // Déterminer le type de page
        let pageType = 'standard';
        if (path === '/' || path === '') pageType = 'homepage';
        else if (path.includes('/our-team')) pageType = 'our_team';
        else if (path.includes('/contact')) pageType = 'contact';
        else if (path.includes('/training')) pageType = 'training';
        else if (path.includes('/case-study')) pageType = 'case_study';
        else if (path.includes('/services')) pageType = 'services';
        else if (path.includes('/b2b-marketing') || path.includes('/abm')) pageType = 'b2b_marketing';
        else if (path.includes('/automotive')) pageType = 'automotive';
        
        return {
            pageType,
            hasLeadForms,
            customDimensions: {
                page_category: this.getPageCategory(path),
                content_language: getCurrentLanguage()
            }
        };
    }
    
    // Obtenir la catégorie de page
    getPageCategory(path) {
        if (path.includes('/training')) return 'training';
        if (path.includes('/services')) return 'services';
        if (path.includes('/b2b-marketing') || path.includes('/abm')) return 'b2b_marketing';
        if (path.includes('/automotive')) return 'automotive';
        if (path.includes('/case-study')) return 'case_studies';
        if (path.includes('/our-team')) return 'about';
        if (path.includes('/contact')) return 'contact';
        if (path === '/' || path === '') return 'homepage';
        return 'other';
    }

    // Chargement des composants
    async loadComponents() {
        const componentsToLoad = [
            { name: 'header', loader: loadHeader },
            { name: 'footer', loader: loadFooter },
            { name: 'language-switcher', loader: loadLanguageSwitcher },
            { name: 'clients-carousel', loader: loadClientsCarousel }
        ];

        for (const component of componentsToLoad) {
            try {
                await component.loader();
                this.components.set(component.name, { loaded: true, initialized: false });
                console.log(`📦 Component loaded: ${component.name}`);
            } catch (error) {
                console.warn(`⚠️ Failed to load component ${component.name}:`, error);
                this.components.set(component.name, { loaded: false, error });
            }
        }
    }

    // Initialisation des fonctionnalités
    initializeFeatures() {
        // Smooth scrolling pour les liens ancres
        this.initializeSmoothScrolling();
        
        // Animations au scroll
        if (AppConfig.features.animationsOnScroll) {
            this.initializeScrollAnimations();
        }
        
        // Lazy loading des images
        this.initializeLazyLoading();
        
        // Form enhancements
        this.initializeFormEnhancements();
        
        // PWA features (si applicable)
        this.initializePWAFeatures();
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Page lifecycle events
        window.addEventListener('load', this.handlePageLoad);
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Scroll and resize events (throttled)
        window.addEventListener('scroll', this.throttle(this.handleScroll, 16));
        window.addEventListener('resize', this.throttle(this.handleResize, 100));
        
        // Visibility change for performance optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Custom events
        window.addEventListener('mydigipal:language-changed', this.handleLanguageChange.bind(this));
    }

    // Smooth scrolling pour les liens ancres
    initializeSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                const headerOffset = document.querySelector('.header')?.offsetHeight || 0;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Analytics tracking
                this.trackEvent('smooth_scroll', {
                    target_id: targetId,
                    scroll_distance: Math.abs(offsetPosition - window.pageYOffset)
                });
            }
        });
    }

    // Animations au scroll avec Intersection Observer
    initializeScrollAnimations() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Une fois animé, on peut arrêter d'observer
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observer tous les éléments avec la classe animate-on-scroll
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in');
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.set('animation', animationObserver);
    }

    // Lazy loading des images
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        lazyImageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                lazyImageObserver.observe(img);
            });

            this.observers.set('lazyLoading', lazyImageObserver);
        }
    }

    // Améliorations des formulaires
    initializeFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Validation en temps réel
            this.setupFormValidation(form);
            
            // Sauvegarde automatique des drafts
            this.setupFormAutosave(form);
            
            // Analytics des formulaires
            this.setupFormAnalytics(form);
        });
    }

    // Configuration de la validation des formulaires
    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Validation en temps réel pour certains champs
                if (input.type === 'email' || input.hasAttribute('data-validate-realtime')) {
                    this.validateField(input);
                }
            });
        });
    }

    // Validation d'un champ
    validateField(field) {
        let isValid = true;
        let errorMessage = '';
        
        // Validation de base
        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        } else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer une adresse email valide';
            }
        }
        
        // Mise à jour de l'UI
        this.updateFieldValidationUI(field, isValid, errorMessage);
        
        return isValid;
    }

    // Mise à jour de l'UI de validation
    updateFieldValidationUI(field, isValid, errorMessage) {
        const fieldContainer = field.closest('.form-field') || field.parentElement;
        
        // Supprimer les messages d'erreur existants
        const existingError = fieldContainer.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Mise à jour des classes
        field.classList.toggle('field-valid', isValid);
        field.classList.toggle('field-invalid', !isValid);
        
        // Ajouter le message d'erreur si nécessaire
        if (!isValid && errorMessage) {
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            fieldContainer.appendChild(errorElement);
        }
    }

    // Configuration de la sauvegarde automatique
    setupFormAutosave(form) {
        if (!form.dataset.autosave) return;
        
        const formId = form.id || 'form-' + Date.now();
        const storageKey = `mydigipal-draft-${formId}`;
        
        // Charger le draft sauvegardé
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(name => {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field && field.type !== 'password') {
                        field.value = data[name];
                    }
                });
            } catch (error) {
                console.warn('Failed to restore form draft:', error);
            }
        }
        
        // Sauvegarder les modifications
        const saveFormData = this.debounce(() => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem(storageKey, JSON.stringify(data));
        }, 1000);
        
        form.addEventListener('input', saveFormData);
        
        // Supprimer le draft après soumission réussie
        form.addEventListener('submit', () => {
            localStorage.removeItem(storageKey);
        });
    }

    // Analytics des formulaires
    setupFormAnalytics(form) {
        let startTime = null;
        
        // Début d'interaction avec le formulaire
        form.addEventListener('focus', () => {
            if (!startTime) {
                startTime = Date.now();
                this.trackEvent('form_start', {
                    form_id: form.id,
                    form_name: form.name || 'unnamed'
                });
            }
        }, { capture: true, once: true });
        
        // Soumission du formulaire
        form.addEventListener('submit', (e) => {
            const completionTime = startTime ? Date.now() - startTime : 0;
            
            this.trackEvent('form_submit', {
                form_id: form.id,
                form_name: form.name || 'unnamed',
                completion_time: completionTime,
                fields_count: form.querySelectorAll('input, textarea, select').length
            });
        });
        
        // Abandon du formulaire
        let interacted = false;
        form.addEventListener('input', () => { interacted = true; }, { once: true });
        
        window.addEventListener('beforeunload', () => {
            if (startTime && interacted && !form.dataset.submitted) {
                this.trackEvent('form_abandon', {
                    form_id: form.id,
                    time_spent: Date.now() - startTime
                });
            }
        });
    }

    // Fonctionnalités PWA
    initializePWAFeatures() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
        
        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
    }

    // Monitoring des performances
    initializePerformanceMonitoring() {
        // Core Web Vitals
        if ('web-vitals' in window) {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(this.sendToAnalytics);
                getFID(this.sendToAnalytics);
                getFCP(this.sendToAnalytics);
                getLCP(this.sendToAnalytics);
                getTTFB(this.sendToAnalytics);
            });
        }
        
        // Performance Observer
        if ('PerformanceObserver' in window) {
            const perfObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.trackEvent('page_load_performance', {
                            load_time: entry.loadEventEnd - entry.loadEventStart,
                            dom_content_loaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            first_paint: entry.responseEnd - entry.requestStart
                        });
                    }
                }
            });
            
            perfObserver.observe({ entryTypes: ['navigation'] });
        }
    }

    // Gestion des erreurs globales
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error?.toString()
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('promise_rejection', {
                reason: e.reason?.toString()
            });
        });
    }

    // Gestionnaires d'événements
    handlePageLoad() {
        // Le page_view est automatiquement tracké par GTM à l'initialisation
        // Pas besoin de tracker ici sauf données supplémentaires
        const additionalData = {
            load_time: performance.now(),
            dom_ready: document.readyState === 'complete'
        };
        
        if (this.gtm) {
            this.gtm.trackPageView(additionalData);
        }
    }

    handleScroll() {
        // Parallax effects ou autres animations basées sur le scroll
        const scrollY = window.pageYOffset;
        const scrollPercent = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        // Dispatch custom event pour d'autres composants
        window.dispatchEvent(new CustomEvent('mydigipal:scroll', {
            detail: { scrollY, scrollPercent }
        }));
    }

    handleResize() {
        // Mise à jour des dimensions pour les composants responsive
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        window.dispatchEvent(new CustomEvent('mydigipal:resize', {
            detail: viewport
        }));
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause des animations et vidéos pour économiser les ressources
            this.pauseAnimations();
        } else {
            this.resumeAnimations();
        }
    }

    handleBeforeUnload() {
        // Nettoyage avant fermeture de la page
        this.observers.forEach(observer => observer.disconnect());
        this.components.clear();
    }

    handleLanguageChange(event) {
        this.currentLanguage = event.detail.language;
        // Recharger les composants dépendants de la langue si nécessaire
    }

    // Analytics et tracking
    initializeAnalytics() {
        // GTM est déjà initialisé dans initializeCore()
        // Ici on peut ajouter d'autres analytics si nécessaire
        
        if (!AppConfig.features.analytics) return;
        
        console.log('📊 Analytics initialized via GTM component');
    }

    trackEvent(eventName, parameters = {}) {
        // Utiliser GTM pour le tracking au lieu de dataLayer direct
        if (this.gtm) {
            this.gtm.push({
                event: eventName,
                ...parameters,
                timestamp: new Date().toISOString()
            });
        }
        
        // Debug en mode développement
        if (AppConfig.environment === 'development') {
            console.log('📊 Event tracked via GTM:', eventName, parameters);
        }
    }

    sendToAnalytics(metric) {
        this.trackEvent('web_vital', {
            name: metric.name,
            value: metric.value,
            delta: metric.delta,
            id: metric.id
        });
    }

    // Gestion des animations
    pauseAnimations() {
        document.body.style.animationPlayState = 'paused';
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.body.style.animationPlayState = 'running';
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    // Utilitaires
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Gestion d'erreur d'initialisation
    handleInitError(error) {
        // Afficher un message d'erreur à l'utilisateur
        const errorMessage = document.createElement('div');
        errorMessage.className = 'app-error';
        errorMessage.innerHTML = `
            <div class="error-content">
                <h3>Une erreur est survenue</h3>
                <p>Veuillez rafraîchir la page ou contacter le support.</p>
                <button onclick="window.location.reload()">Rafraîchir</button>
            </div>
        `;
        document.body.appendChild(errorMessage);
        
        // Tracker l'erreur
        this.trackEvent('app_init_error', {
            error_message: error.message,
            error_stack: error.stack
        });
    }

    // API publique pour d'autres scripts
    getComponent(name) {
        return this.components.get(name);
    }

    getAllComponents() {
        return Array.from(this.components.keys());
    }

    isComponentLoaded(name) {
        return this.components.get(name)?.loaded || false;
    }
}

// Instance globale
const app = new MyDigipalApp();

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}

// Export pour utilisation dans d'autres modules
export default app;
export { MyDigipalApp, AppConfig };

// API globale pour compatibilité
window.MyDigipal = {
    app,
    version: AppConfig.version,
    trackEvent: app.trackEvent.bind(app),
    trackCTAClick: (text, location, url) => trackCTAClick(text, location, url),
    getCurrentLanguage,
    switchLanguage: () => {
        const switcher = document.getElementById('languageSwitcher');
        if (switcher) switcher.click();
    },
    getGTM: () => getGTM()
};

// Styles CSS pour les erreurs et animations
const appStyles = `
/* App global styles */
.app-error {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
}

.error-content {
    background: var(--dark-gray);
    padding: var(--spacing-2xl);
    border-radius: 12px;
    text-align: center;
    max-width: 400px;
}

.error-content button {
    background: var(--primary-blue);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: 8px;
    cursor: pointer;
    margin-top: var(--spacing-md);
}

/* Animations globales */
.animate-on-scroll,
.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.animate-on-scroll.animate-in,
.fade-in.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Form validation styles */
.field-valid {
    border-color: var(--success-green) !important;
    box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
}

.field-invalid {
    border-color: var(--error-red) !important;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.field-error {
    color: var(--error-red);
    font-size: 0.875rem;
    margin-top: var(--spacing-xs);
}

/* Lazy loading styles */
img.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

img.loaded {
    opacity: 1;
}

/* Loading states */
.loading {
    opacity: 0.6;
    pointer-events: none;
}
`;

// Injecter les styles
const styleElement = document.createElement('style');
styleElement.textContent = appStyles;
document.head.appendChild(styleElement);

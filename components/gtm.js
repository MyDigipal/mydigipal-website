// components/gtm.js - Google Tag Manager Component

// Configuration GTM
const GTM_CONFIG = {
    containerId: 'GTM-P4TSQ9Q',
    dataLayerName: 'dataLayer',
    environment: 'production', // ou 'development'
    debug: false // Activé en développement
};

// GTM Script HTML pour le <head>
export const gtmHeadScript = `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','${GTM_CONFIG.dataLayerName}','${GTM_CONFIG.containerId}');</script>
<!-- End Google Tag Manager -->
`;

// GTM NoScript HTML pour le <body>
export const gtmBodyScript = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_CONFIG.containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

// Classe GTM Manager
class GTMManager {
    constructor() {
        this.isInitialized = false;
        this.containerId = GTM_CONFIG.containerId;
        this.dataLayerName = GTM_CONFIG.dataLayerName;
        this.hasLeadForms = false;
        this.pageType = 'standard';
        
        // Initialiser dataLayer
        window[this.dataLayerName] = window[this.dataLayerName] || [];
    }

    // Initialiser GTM pour la page
    init(pageConfig = {}) {
        if (this.isInitialized) {
            console.warn('GTM already initialized');
            return;
        }

        const {
            pageType = 'standard',
            hasLeadForms = false,
            customDimensions = {}
        } = pageConfig;

        this.pageType = pageType;
        this.hasLeadForms = hasLeadForms;

        // Injecter les scripts GTM si pas déjà présents
        this.injectGTMScripts();

        // Configuration initiale
        this.pushInitialData(customDimensions);

        this.isInitialized = true;

        if (GTM_CONFIG.debug) {
            console.log('✅ GTM initialized:', {
                containerId: this.containerId,
                pageType: this.pageType,
                hasLeadForms: this.hasLeadForms
            });
        }
    }

    // Injecter les scripts GTM dynamiquement si nécessaire
    injectGTMScripts() {
        // Vérifier si GTM n'est pas déjà chargé
        if (document.querySelector(`script[src*="${this.containerId}"]`)) {
            return; // Déjà chargé
        }

        // Injecter le script head
        const headScript = document.createElement('script');
        headScript.innerHTML = gtmHeadScript.replace(/<script>|<\/script>/g, '').replace(/<!-- .* -->/g, '');
        document.head.appendChild(headScript);

        // Injecter le noscript body
        const noscriptContainer = document.createElement('div');
        noscriptContainer.innerHTML = gtmBodyScript;
        document.body.insertBefore(noscriptContainer.firstElementChild, document.body.firstChild);

        if (GTM_CONFIG.debug) {
            console.log('📄 GTM scripts injected dynamically');
        }
    }

    // Données initiales à pousser
    pushInitialData(customDimensions = {}) {
        const initialData = {
            event: 'page_view',
            page_title: document.title,
            page_url: window.location.href,
            page_type: this.pageType,
            page_language: document.documentElement.lang || 'en',
            has_lead_forms: this.hasLeadForms,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            ...customDimensions
        };

        this.push(initialData);
    }

    // Push générique vers dataLayer
    push(data) {
        if (!window[this.dataLayerName]) {
            console.warn('DataLayer not available');
            return;
        }

        window[this.dataLayerName].push(data);

        if (GTM_CONFIG.debug) {
            console.log('📊 GTM Push:', data);
        }
    }

    // === MÉTHODES DE TRACKING SPÉCIFIQUES ===

    // Page view (appelé automatiquement à l'init)
    trackPageView(additionalData = {}) {
        this.push({
            event: 'page_view_manual',
            ...additionalData,
            timestamp: new Date().toISOString()
        });
    }

    // CTA clicks (toutes les pages)
    trackCTAClick(ctaText, ctaLocation, destinationUrl = '') {
        this.push({
            event: 'cta_click',
            cta_text: ctaText,
            cta_location: ctaLocation,
            destination_url: destinationUrl,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Navigation interne
    trackInternalNavigation(linkText, destination) {
        this.push({
            event: 'internal_navigation',
            link_text: linkText,
            destination: destination,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Changement de langue
    trackLanguageSwitch(fromLang, toLang, fromUrl, toUrl) {
        this.push({
            event: 'language_switch',
            from_language: fromLang,
            to_language: toLang,
            from_url: fromUrl,
            to_url: toUrl,
            timestamp: new Date().toISOString()
        });
    }

    // === MÉTHODES LEAD FORMS (uniquement si hasLeadForms = true) ===

    // Début d'interaction avec formulaire
    trackFormStart(formType, formId = '') {
        if (!this.hasLeadForms) {
            if (GTM_CONFIG.debug) console.warn('Form tracking called but hasLeadForms is false');
            return;
        }

        this.push({
            event: 'form_start',
            form_type: formType,
            form_id: formId,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Focus sur champ de formulaire
    trackFormFieldFocus(fieldName, formType) {
        if (!this.hasLeadForms) return;

        this.push({
            event: 'form_field_focus',
            form_type: formType,
            field_name: fieldName,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Soumission de formulaire de lead
    trackLeadGeneration(formType, leadData = {}) {
        if (!this.hasLeadForms) {
            console.warn('Lead tracking called but hasLeadForms is false');
            return;
        }

        const leadScore = this.calculateLeadScore(leadData);

        this.push({
            event: 'lead_generated',
            form_type: formType,
            lead_source: 'website',
            lead_quality_score: leadScore,
            service_interest: leadData.service || '',
            budget_range: leadData.budget || '',
            company_provided: !!leadData.company,
            message_length: leadData.message ? leadData.message.length : 0,
            form_completion_time: leadData.completionTime || null,
            page_url: window.location.href,
            timestamp: new Date().toISOString(),
            // N8N webhook compatible data
            n8n_webhook: true,
            client_info: {
                user_agent: navigator.userAgent,
                language: navigator.language,
                referrer: document.referrer,
                viewport: `${window.innerWidth}x${window.innerHeight}`
            },
            lead_data: {
                name: leadData.name || '',
                email: leadData.email || '',
                company: leadData.company || '',
                service: leadData.service || '',
                budget: leadData.budget || '',
                message: leadData.message || ''
            }
        });
    }

    // Abandon de formulaire
    trackFormAbandon(formType, timeSpent, fieldsCompleted = 0) {
        if (!this.hasLeadForms) return;

        this.push({
            event: 'form_abandon',
            form_type: formType,
            time_spent: timeSpent,
            fields_completed: fieldsCompleted,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // === MÉTHODES UTILITAIRES ===

    // Calculer le score de qualité d'un lead
    calculateLeadScore(leadData) {
        let score = 0;
        
        // Points par champ rempli
        if (leadData.company) score += 20;
        if (leadData.service) score += 30;
        if (leadData.budget) score += 40;
        if (leadData.message && leadData.message.length > 50) score += 10;
        
        return Math.min(score, 100); // Max 100 points
    }

    // Tracking des erreurs
    trackError(errorType, errorMessage, errorDetails = {}) {
        this.push({
            event: 'javascript_error',
            error_type: errorType,
            error_message: errorMessage,
            error_details: errorDetails,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // Performance tracking
    trackPerformance(metrics) {
        this.push({
            event: 'performance_metrics',
            ...metrics,
            page_url: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    // === API PUBLIQUE ===

    // Obtenir l'instance GTM
    getInstance() {
        return this;
    }

    // Vérifier si GTM est initialisé
    isReady() {
        return this.isInitialized;
    }

    // Configuration actuelle
    getConfig() {
        return {
            containerId: this.containerId,
            pageType: this.pageType,
            hasLeadForms: this.hasLeadForms,
            isInitialized: this.isInitialized
        };
    }
}

// Instance singleton
let gtmInstance = null;

// Fonction d'initialisation pour les pages
export function initGTM(pageConfig = {}) {
    if (!gtmInstance) {
        gtmInstance = new GTMManager();
    }
    
    gtmInstance.init(pageConfig);
    return gtmInstance;
}

// Obtenir l'instance GTM
export function getGTM() {
    if (!gtmInstance) {
        console.warn('GTM not initialized. Call initGTM() first.');
        return null;
    }
    return gtmInstance;
}

// Fonctions de tracking globales (pour compatibilité)
export function trackCTAClick(ctaText, ctaLocation, destinationUrl = '') {
    const gtm = getGTM();
    if (gtm) {
        gtm.trackCTAClick(ctaText, ctaLocation, destinationUrl);
    }
}

export function trackLeadGeneration(formType, leadData = {}) {
    const gtm = getGTM();
    if (gtm) {
        gtm.trackLeadGeneration(formType, leadData);
    }
}

export function trackFormStart(formType, formId = '') {
    const gtm = getGTM();
    if (gtm) {
        gtm.trackFormStart(formType, formId);
    }
}

export function trackFormFieldFocus(fieldName, formType) {
    const gtm = getGTM();
    if (gtm) {
        gtm.trackFormFieldFocus(fieldName, formType);
    }
}

export function trackLanguageSwitch(fromLang, toLang, fromUrl, toUrl) {
    const gtm = getGTM();
    if (gtm) {
        gtm.trackLanguageSwitch(fromLang, toLang, fromUrl, toUrl);
    }
}

// Auto-setup global error tracking
export function setupGlobalErrorTracking() {
    const gtm = getGTM();
    if (!gtm) return;

    // JavaScript errors
    window.addEventListener('error', (e) => {
        gtm.trackError('javascript_error', e.message, {
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error_stack: e.error?.stack
        });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        gtm.trackError('promise_rejection', e.reason?.toString() || 'Unknown rejection', {
            reason: e.reason
        });
    });
}

// Export de la configuration pour référence
export { GTM_CONFIG };

// Export des scripts pour injection manuelle si nécessaire
export { gtmHeadScript, gtmBodyScript };

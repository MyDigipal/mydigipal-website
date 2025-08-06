// components/clients-carousel.js
export const clientsCarouselHTML = `
<section class="clients">
    <h3>Trusted by Leading Companies Worldwide</h3>
    <p class="clients-subtitle">Join 50+ global companies that trust MyDigipal for their AI-powered digital marketing success</p>
    
    <div class="logos-carousel">
        <!-- Première ligne : Gauche vers Droite -->
        <div class="logos-row">
            <div class="logos-track left-to-right">
                <!-- Entreprises avec case studies en premier (liens cliquables) -->
                <a href="/case-study/dmd" class="client-logo-text" title="View DMD Group Case Study">Groupe DMD</a>
                <a href="/case-study/gwi-paid-media-success" class="client-logo-text" title="View GWI Case Study">GWI</a>
                <a href="/case-study/symbl-digital-marketing-introduction" class="client-logo-text" title="View Symbl.ai Case Study">Symbl.ai</a>
                <a href="/case-study/genesys-revamping-abm" class="client-logo-text" title="View Genesys Case Study">Genesys</a>
                
                <!-- Autres clients importants (sans liens) -->
                <div class="client-logo-text">Goliath Technologies</div>
                <div class="client-logo-text">Servion Global</div>
                <div class="client-logo-text">CX Ninjas</div>
                <div class="client-logo-text">Edenred</div>
                <div class="client-logo-text">Frontline Education</div>
                
                <!-- Duplication pour l'effet de défilement infini -->
                <a href="/case-study/dmd" class="client-logo-text" title="View DMD Group Case Study">Groupe DMD</a>
                <a href="/case-study/gwi-paid-media-success" class="client-logo-text" title="View GWI Case Study">GWI</a>
                <a href="/case-study/symbl-digital-marketing-introduction" class="client-logo-text" title="View Symbl.ai Case Study">Symbl.ai</a>
                <a href="/case-study/genesys-revamping-abm" class="client-logo-text" title="View Genesys Case Study">Genesys</a>
                
                <div class="client-logo-text">Goliath Technologies</div>
                <div class="client-logo-text">Servion Global</div>
                <div class="client-logo-text">CX Ninjas</div>
                <div class="client-logo-text">Edenred</div>
                <div class="client-logo-text">Frontline Education</div>
            </div>
        </div>
        
        <!-- Deuxième ligne : Droite vers Gauche -->
        <div class="logos-row">
            <div class="logos-track right-to-left">
                <!-- Entreprises avec case studies (suite) -->
                <a href="/case-study/theobald" class="client-logo-text" title="View Theobald Case Study">Groupe Theobald</a>
                <a href="/case-study/vulcain-group-increased-digital-strategy" class="client-logo-text" title="View Vulcain Group Case Study">Vulcain Group</a>
                <a href="/case-study/abm-from-scratch-to-the-cloud" class="client-logo-text" title="View Quantum Metric Case Study">Quantum Metric</a>
                
                <!-- Autres clients -->
                <div class="client-logo-text">LuxSci</div>
                <div class="client-logo-text">Omilia</div>
                <div class="client-logo-text">Prêt à Pousser</div>
                <div class="client-logo-text">We Factory</div>
                <div class="client-logo-text">Integrate</div>
                <div class="client-logo-text">Velocity Partners</div>
                
                <!-- Duplication pour l'effet de défilement infini -->
                <a href="/case-study/theobald" class="client-logo-text" title="View Theobald Case Study">Groupe Theobald</a>
                <a href="/case-study/vulcain-group-increased-digital-strategy" class="client-logo-text" title="View Vulcain Group Case Study">Vulcain Group</a>
                <a href="/case-study/abm-from-scratch-to-the-cloud" class="client-logo-text" title="View Quantum Metric Case Study">Quantum Metric</a>
                
                <div class="client-logo-text">LuxSci</div>
                <div class="client-logo-text">Omilia</div>
                <div class="client-logo-text">Prêt à Pousser</div>
                <div class="client-logo-text">We Factory</div>
                <div class="client-logo-text">Integrate</div>
                <div class="client-logo-text">Velocity Partners</div>
            </div>
        </div>
    </div>
</section>
`;

export const clientsCarouselCSS = `
/* Clients Carousel Styles */
.clients {
    padding: var(--spacing-2xl) var(--spacing-lg);
    background: var(--white);
    text-align: center;
    overflow: hidden;
}

.clients h3 {
    font-size: 1.4rem;
    font-weight: var(--font-semibold);
    color: var(--dark-gray);
    margin-bottom: var(--spacing-md);
}

.clients-subtitle {
    font-size: 1rem;
    color: var(--medium-gray);
    margin-bottom: var(--spacing-2xl);
}

.logos-carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
    margin: 0 auto;
}

.logos-row {
    margin-bottom: var(--spacing-xl);
    position: relative;
    z-index: 1;
}

.logos-row:last-child {
    margin-bottom: 0;
}

.logos-track {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xl);
    width: fit-content;
}

.logos-track.left-to-right {
    animation: scroll-logos-right 40s linear infinite;
}

.logos-track.right-to-left {
    animation: scroll-logos-left 35s linear infinite;
}

.client-logo {
    height: 60px;
    width: auto;
    filter: grayscale(100%) opacity(0.6);
    transition: var(--transition-fast);
    flex-shrink: 0;
}

.client-logo:hover {
    filter: grayscale(0%) opacity(1);
    transform: scale(1.05);
}

/* Animation de défilement des logos */
@keyframes scroll-logos-right {
    0% {
        transform: translateX(-50%);
    }
    100% {
        transform: translateX(0);
    }
}

@keyframes scroll-logos-left {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

.logos-track:hover {
    animation-play-state: paused;
}

/* Logos en tant que texte stylisé pour les marques sans image */
.client-logo-text {
    font-size: 1.2rem;
    font-weight: var(--font-bold);
    color: var(--medium-gray);
    background: var(--light-gray);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: 12px;
    white-space: nowrap;
    transition: var(--transition-fast);
    height: 60px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    border: 2px solid transparent;
}

.client-logo-text:hover {
    color: var(--primary-blue);
    background: var(--white);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--light-gray);
}

/* Style spécial pour les liens vers case studies */
a.client-logo-text {
    text-decoration: none;
    position: relative;
}

a.client-logo-text::after {
    content: "📋";
    position: absolute;
    bottom: 5px;
    right: 8px;
    font-size: 0.7rem;
    background: var(--success-green);
    color: var(--white);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--white);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: var(--transition-fast);
}

a.client-logo-text::before {
    content: "Case Study";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--dark-gray);
    color: var(--white);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: var(--font-medium);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: var(--transition-fast);
    z-index: 100;
    margin-bottom: 5px;
}

a.client-logo-text:hover::before {
    opacity: 1;
}

a.client-logo-text:hover::after {
    background: var(--primary-blue);
    transform: scale(1.1);
}

a.client-logo-text:hover {
    color: var(--white);
    background: var(--primary-blue);
    transform: scale(1.05);
    border-color: var(--primary-blue);
}

/* Responsive */
@media (max-width: 768px) {
    .logos-track {
        gap: var(--spacing-lg);
    }
    
    .client-logo-text {
        font-size: 1rem;
        padding: var(--spacing-sm) var(--spacing-md);
        height: 50px;
    }
    
    .client-logo {
        height: 50px;
    }
}

@media (max-width: 480px) {
    .logos-track {
        gap: var(--spacing-md);
    }
    
    .client-logo-text {
        font-size: 0.9rem;
        padding: var(--spacing-xs) var(--spacing-sm);
        height: 45px;
    }
}
`;

// Data structure for clients
export const clientsData = {
    withCaseStudies: [
        { name: "Groupe DMD", url: "/case-study/dmd" },
        { name: "GWI", url: "/case-study/gwi-paid-media-success" },
        { name: "Symbl.ai", url: "/case-study/symbl-digital-marketing-introduction" },
        { name: "Genesys", url: "/case-study/genesys-revamping-abm" },
        { name: "Groupe Theobald", url: "/case-study/theobald" },
        { name: "Vulcain Group", url: "/case-study/vulcain-group-increased-digital-strategy" },
        { name: "Quantum Metric", url: "/case-study/abm-from-scratch-to-the-cloud" }
    ],
    otherClients: [
        "Goliath Technologies", "Servion Global", "CX Ninjas", "Edenred", 
        "Frontline Education", "LuxSci", "Omilia", "Prêt à Pousser", 
        "We Factory", "Integrate", "Velocity Partners", "SnapLogic",
        "Upwork", "Contentful", "Aircall", "Livestorm"
    ]
};

// Function to generate dynamic carousel
export function generateClientsCarousel(customClients = null) {
    const clients = customClients || clientsData;
    
    const firstRowClients = [...clients.withCaseStudies.slice(0, 4), ...clients.otherClients.slice(0, 5)];
    const secondRowClients = [...clients.withCaseStudies.slice(4), ...clients.otherClients.slice(5)];
    
    const createClientElement = (client) => {
        if (typeof client === 'object' && client.url) {
            return `<a href="${client.url}" class="client-logo-text" title="View ${client.name} Case Study">${client.name}</a>`;
        } else {
            return `<div class="client-logo-text">${client}</div>`;
        }
    };
    
    const firstRow = firstRowClients.map(createClientElement).join('');
    const secondRow = secondRowClients.map(createClientElement).join('');
    
    return `
    <section class="clients">
        <h3>Trusted by Leading Companies Worldwide</h3>
        <p class="clients-subtitle">Join 50+ global companies that trust MyDigipal for their AI-powered digital marketing success</p>
        
        <div class="logos-carousel">
            <div class="logos-row">
                <div class="logos-track left-to-right">
                    ${firstRow}
                    ${firstRow} <!-- Duplication pour effet infini -->
                </div>
            </div>
            
            <div class="logos-row">
                <div class="logos-track right-to-left">
                    ${secondRow}
                    ${secondRow} <!-- Duplication pour effet infini -->
                </div>
            </div>
        </div>
    </section>
    `;
}

// Function to load and initialize clients carousel
export function loadClientsCarousel(containerId = 'clients-carousel', customClients = null) {
    // Insert carousel HTML
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = generateClientsCarousel(customClients);
    }
    
    // Add carousel styles if not already present
    if (!document.getElementById('clients-carousel-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'clients-carousel-styles';
        styleElement.textContent = clientsCarouselCSS;
        document.head.appendChild(styleElement);
    }
    
    // Initialize carousel functionality
    initializeClientsCarousel();
}

function initializeClientsCarousel() {
    // Pause animation on hover for better UX
    const logosTracks = document.querySelectorAll('.logos-track');
    
    logosTracks.forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });
    
    // Track clicks on case study links for analytics
    const caseStudyLinks = document.querySelectorAll('a.client-logo-text');
    caseStudyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // GTM tracking for case study clicks
            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'case_study_click',
                    case_study_name: link.textContent.trim(),
                    case_study_url: link.href,
                    click_location: 'clients_carousel',
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
    
    // Intersection Observer for performance optimization
    const carousel = document.querySelector('.logos-carousel');
    if (carousel && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const tracks = entry.target.querySelectorAll('.logos-track');
                if (entry.isIntersecting) {
                    tracks.forEach(track => {
                        track.style.animationPlayState = 'running';
                    });
                } else {
                    tracks.forEach(track => {
                        track.style.animationPlayState = 'paused';
                    });
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(carousel);
    }
}

// Utility function to add new clients dynamically
export function addClient(clientName, caseStudyUrl = null) {
    if (caseStudyUrl) {
        clientsData.withCaseStudies.push({ name: clientName, url: caseStudyUrl });
    } else {
        clientsData.otherClients.push(clientName);
    }
}

// Utility function to update case study URL for existing client
export function updateClientCaseStudy(clientName, caseStudyUrl) {
    const existingClient = clientsData.withCaseStudies.find(c => c.name === clientName);
    if (existingClient) {
        existingClient.url = caseStudyUrl;
    } else {
        // Move from other clients to case study clients
        const index = clientsData.otherClients.indexOf(clientName);
        if (index > -1) {
            clientsData.otherClients.splice(index, 1);
            clientsData.withCaseStudies.push({ name: clientName, url: caseStudyUrl });
        }
    }
}

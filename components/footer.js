// components/footer.js
export const footerHTML = `
<footer class="footer">
    <div class="footer-container">
        <div class="footer-main">
            <div class="footer-brand">
                <a href="/" class="footer-logo">MyDigipal</a>
                <p class="footer-tagline">More Than a Pair of Hands</p>
                <p class="footer-description">
                    AI-powered international marketing agency specializing in B2B & B2C digital marketing solutions. 
                    We help businesses accelerate growth through strategic marketing and innovative AI technologies.
                </p>
            </div>
            
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="/paid-social">Paid Social</a></li>
                        <li><a href="/paid-search">Paid Search</a></li>
                        <li><a href="/content-creation">Content Creation</a></li>
                        <li><a href="/marketing-automation">Marketing Automation</a></li>
                        <li><a href="/seo">SEO</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>B2B Marketing</h4>
                    <ul>
                        <li><a href="/abm">ABM</a></li>
                        <li><a href="/campaign-management">Campaign Management</a></li>
                        <li><a href="/marketing-strategy">Marketing Strategy</a></li>
                        <li><a href="/content-syndication">Content Syndication</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Training</h4>
                    <ul>
                        <li><a href="/training">All Trainings</a></li>
                        <li><a href="/training/ai">AI Training</a></li>
                        <li><a href="/training/abm">ABM Training</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="/our-team">Our Team</a></li>
                        <li><a href="/case-studies">Case Studies</a></li>
                        <li><a href="/blogs">Blog</a></li>
                        <li><a href="/contact-us">Contact</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="footer-cta">
            <h3>Ready to Take Your Digital Activity to the Next Level?</h3>
            <p>Try the anti-agency model for a ride. No long-term commitments, just results.</p>
            <a href="/contact-us" class="footer-cta-btn">Start Your Project Today</a>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-bottom-left">
                <p>&copy; 2025 MyDigipal. All rights reserved.</p>
            </div>
            <div class="footer-bottom-right">
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>
`;

export const footerCSS = `
/* Footer Styles */
.footer {
    background: var(--dark-gray);
    color: var(--white);
    padding: var(--spacing-2xl) 0 0;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

.footer-main {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);
}

.footer-brand {
    max-width: 400px;
}

.footer-logo {
    font-size: 1.8rem;
    font-weight: var(--font-bold);
    color: var(--primary-blue);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
}

.footer-logo::before {
    content: "■";
    color: var(--secondary-purple);
    font-size: 1.5rem;
}

.footer-tagline {
    font-size: 1.1rem;
    font-weight: var(--font-semibold);
    color: var(--primary-blue);
    margin-bottom: var(--spacing-md);
}

.footer-description {
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.8);
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xl);
}

.footer-column h4 {
    font-size: 1.1rem;
    font-weight: var(--font-semibold);
    margin-bottom: var(--spacing-md);
    color: var(--white);
}

.footer-column ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.footer-column ul li {
    margin-bottom: var(--spacing-xs);
}

.footer-column ul li a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: var(--transition-fast);
    font-size: 0.95rem;
}

.footer-column ul li a:hover {
    color: var(--primary-blue);
}

.footer-cta {
    background: linear-gradient(135deg, var(--primary-blue), var(--secondary-purple));
    padding: var(--spacing-2xl);
    border-radius: 16px;
    text-align: center;
    margin-bottom: var(--spacing-2xl);
}

.footer-cta h3 {
    font-size: 2rem;
    font-weight: var(--font-semibold);
    margin-bottom: var(--spacing-md);
}

.footer-cta p {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-xl);
    opacity: 0.9;
}

.footer-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--white);
    color: var(--primary-blue);
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: 12px;
    text-decoration: none;
    font-weight: var(--font-semibold);
    font-size: 1.1rem;
    transition: var(--transition-medium);
}

.footer-cta-btn:hover {
    background: var(--light-gray);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg) 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom-left p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.footer-bottom-right {
    display: flex;
    gap: var(--spacing-lg);
}

.footer-bottom-right a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    transition: var(--transition-fast);
}

.footer-bottom-right a:hover {
    color: var(--primary-blue);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .footer-main {
        grid-template-columns: 1fr;
        gap: var(--spacing-xl);
    }
    
    .footer-links {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
    }
    
    .footer-cta {
        padding: var(--spacing-xl);
    }
    
    .footer-cta h3 {
        font-size: 1.5rem;
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }
    
    .footer-bottom-right {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .footer-links {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }
}
`;

// Function to load and initialize footer
export function loadFooter() {
    // Insert footer HTML
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }
    
    // Add footer styles if not already present
    if (!document.getElementById('footer-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'footer-styles';
        styleElement.textContent = footerCSS;
        document.head.appendChild(styleElement);
    }
    
    // Initialize footer functionality
    initializeFooter();
}

function initializeFooter() {
    // Add any footer-specific JavaScript functionality here
    // For example: newsletter signup, social media links, etc.
    
    // Add smooth scroll for internal links
    const footerLinks = document.querySelectorAll('.footer a[href^="#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

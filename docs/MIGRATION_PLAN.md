# MyDigipal Website Migration Plan
## Webflow → Astro Migration

**Document Version:** 1.0
**Date:** 31 December 2024
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [URL Structure Changes](#2-url-structure-changes)
3. [Page Inventory & Gap Analysis](#3-page-inventory--gap-analysis)
4. [301 Redirects Configuration](#4-301-redirects-configuration)
5. [SEO Meta Tags Audit](#5-seo-meta-tags-audit)
6. [LLMs.txt Implementation](#6-llmstxt-implementation)
7. [Security Configuration](#7-security-configuration)
8. [DNS & Hosting Switch](#8-dns--hosting-switch)
9. [Pre-Launch Checklist](#9-pre-launch-checklist)
10. [Post-Launch Monitoring](#10-post-launch-monitoring)

---

## 1. Executive Summary

### Current State
- **Platform:** Webflow
- **Domain:** www.mydigipal.com
- **URL Structure:** EN = root (no prefix), FR = /fr/
- **Total Pages:** ~80 URLs

### Target State
- **Platform:** Astro (hosted on Render)
- **Domain:** mydigipal.com (without www)
- **URL Structure:** EN = /en/, FR = /fr/
- **Deployment:** Static site

### Key Changes
| Aspect | Current (Webflow) | New (Astro) |
|--------|-------------------|-------------|
| Domain | www.mydigipal.com | mydigipal.com |
| EN URLs | /page-name | /en/page-name |
| FR URLs | /fr/page-name | /fr/page-name |
| Blog | /blog/slug | /en/blog/slug |
| Case Studies | /case-study/slug | /en/case-studies/slug |

---

## 2. URL Structure Changes

### Domain Changes
```
OLD: https://www.mydigipal.com/...
NEW: https://mydigipal.com/...
```

### Language Prefix Changes (English)
The biggest change is that English pages now require `/en/` prefix:
```
OLD: https://www.mydigipal.com/paid-social
NEW: https://mydigipal.com/en/services/paid-social
```

### Path Structure Changes
| Category | Old Path | New Path |
|----------|----------|----------|
| Home EN | / | /en |
| Home FR | /fr | /fr |
| Services | /paid-social | /en/services/paid-social |
| Services | /paid-search | /en/services/google-ads |
| Services | /seo | /en/services/seo |
| Services | /email-marketing | /en/services/emailing |
| Services | /ai-training | /en/services/ai-training |
| Blog | /blog/slug | /en/blog/slug |
| Blog List | /blogs | /en/blog |
| Case Studies | /case-studies | /en/case-studies |
| Case Study | /case-study/slug | /en/case-studies/slug |
| Contact | /contact-us | /en/contact |
| Automotive | /automotive/google-ads | /en/automotive/google-ads |

---

## 3. Page Inventory & Gap Analysis

### Pages on New Site ✅
| Page | EN | FR | Status |
|------|----|----|--------|
| Home | /en | /fr | ✅ Ready |
| Google Ads Service | /en/services/google-ads | /fr/services/google-ads | ✅ Ready |
| Paid Social Service | /en/services/paid-social | /fr/services/paid-social | ✅ Ready |
| SEO Service | /en/services/seo | /fr/services/seo | ✅ Ready |
| Emailing Service | /en/services/emailing | /fr/services/emailing | ✅ Ready |
| AI Training | /en/services/ai-training | /fr/services/ai-training | ✅ Ready |
| AI Solutions | /en/services/ai-solutions | /fr/services/ai-solutions | ✅ Ready |
| Contact | /en/contact | /fr/contact | ✅ Ready |
| Calculator | /en/calculator | /fr/calculator | ✅ Ready |
| Blog List | /en/blog | /fr/blog | ✅ Ready |
| Blog Articles | /en/blog/[slug] | /fr/blog/[slug] | ✅ Ready |
| Case Studies List | /en/case-studies | /fr/case-studies | ✅ Ready |
| Case Studies | /en/case-studies/[slug] | /fr/case-studies/[slug] | ✅ Ready |
| Automotive Google Ads | /en/automotive/google-ads | /fr/automotive/google-ads | ✅ Ready |
| Automotive Paid Social | /en/automotive/paid-social | /fr/automotive/paid-social | ✅ Ready |
| Automotive FDA | /en/automotive/facebook-dynamic-ads | /fr/automotive/facebook-dynamic-ads | ✅ Ready |

### Pages Missing on New Site ❌ (Need Decision)
| Old Page | Priority | Recommendation |
|----------|----------|----------------|
| /content-creation | Low | Redirect to /en/services/paid-social or remove |
| /display | Low | Redirect to /en/services/google-ads or remove |
| /content-syndication | Low | Redirect to /en or remove |
| /abm | Medium | Create new page or redirect to case studies |
| /campaign-management | Low | Redirect to /en/services/google-ads |
| /marketing-automation | Medium | Create new page or redirect |
| /marketing-strategy | Low | Redirect to /en or remove |
| /abm-training | Medium | Redirect to /en/services/ai-training |
| /tools-and-solutions | Low | Redirect to /en/services/ai-solutions |
| /our-team | Medium | Create new page |
| /case-study-categories/* | Low | Redirect to /en/case-studies |

### Blog Articles Mapping
| Old Slug | New Slug | Status |
|----------|----------|--------|
| /blog/abm-deck | /en/blog/abm-deck | ✅ |
| /blog/beware-of-scammers | /en/blog/beware-of-scammers | ✅ |
| /blog/facebook-dynamic-ads-for-automotive-dealers | /en/blog/facebook-dynamic-ads-automotive | ⚠️ Slug change |
| /blog/google-consent-mode-v2 | /en/blog/google-consent-mode-v2 | ✅ |
| /blog/how-people-really-use-chatgpt | N/A | ❌ Missing |
| /blog/how-to-rank-on-chatgpt | /en/blog/how-to-rank-on-chatgpt | ✅ |
| /blog/how-to-train-teams-on-ai | /en/blog/how-to-train-teams-on-ai | ✅ |
| /blog/intent-data-in-b2b-marketing | /en/blog/intent-data-b2b-marketing | ⚠️ Slug change |
| /blog/marketing-automation-tools | /en/blog/marketing-automation-tools | ✅ |
| /blog/mydigipal-cx-ninjas-guide-to-partner-marketing | /en/blog/partner-marketing-guide | ⚠️ Slug change |
| /blog/mydigipal-podcast-1-whats-wrong-with-your-abm | /en/blog/podcast-abm | ⚠️ Slug change |
| /blog/open-source-ai-agents | /en/blog/open-source-ai-agents | ✅ |
| /blog/revolutionizing-b2b-marketing-with-abm | /en/blog/revolutionizing-b2b-with-abm | ⚠️ Slug change |
| /blog/successful-linkedin-strategy | /en/blog/successful-linkedin-strategy | ✅ |

### Case Studies Mapping
| Old Slug | New Slug | Status |
|----------|----------|--------|
| /case-study/abm-from-scratch-to-the-cloud | /en/case-studies/quantum-metrics | ⚠️ Slug change |
| /case-study/dmd | /en/case-studies/dmd-group | ⚠️ Slug change |
| /case-study/genesys-revamping-abm | /en/case-studies/genesys | ⚠️ Slug change |
| /case-study/gwi-paid-media-success | /en/case-studies/gwi | ⚠️ Slug change |
| /case-study/symbl-digital-marketing-introduction | /en/case-studies/symbl-ai | ⚠️ Slug change |
| /case-study/theobald | /en/case-studies/theobald-group | ⚠️ Slug change |
| /case-study/vulcain-group-increased-digital-strategy | /en/case-studies/vulcain-group | ⚠️ Slug change |

---

## 4. 301 Redirects Configuration

### Redirect File for Render (_redirects)

Create file: `public/_redirects`

```
# ===========================================
# MyDigipal 301 Redirects - Webflow to Astro
# ===========================================

# Domain redirect (www to non-www)
https://www.mydigipal.com/* https://mydigipal.com/:splat 301!

# ========================
# HOME PAGES
# ========================
/ /en 301
/fr /fr 200

# ========================
# SERVICES (EN)
# ========================
/paid-social /en/services/paid-social 301
/paid-search /en/services/google-ads 301
/seo /en/services/seo 301
/email-marketing /en/services/emailing 301
/ai-training /en/services/ai-training 301
/content-creation /en/services/paid-social 301
/display /en/services/google-ads 301
/content-syndication /en 301
/tools-and-solutions /en/services/ai-solutions 301

# ========================
# SERVICES (FR)
# ========================
/fr/paid-social /fr/services/paid-social 301
/fr/paid-search /fr/services/google-ads 301
/fr/seo /fr/services/seo 301
/fr/email-marketing /fr/services/emailing 301
/fr/ai-training /fr/services/ai-training 301
/fr/content-creation /fr/services/paid-social 301
/fr/display /fr/services/google-ads 301
/fr/content-syndication /fr 301
/fr/tools-and-solutions /fr/services/ai-solutions 301

# ========================
# B2B PAGES (Consolidate)
# ========================
/abm /en/case-studies 301
/campaign-management /en/services/google-ads 301
/marketing-automation /en/services/emailing 301
/marketing-strategy /en 301
/abm-training /en/services/ai-training 301
/fr/abm /fr/case-studies 301
/fr/campaign-management /fr/services/google-ads 301
/fr/marketing-automation /fr/services/emailing 301
/fr/marketing-strategy /fr 301
/fr/abm-training /fr/services/ai-training 301

# ========================
# AUTOMOTIVE (EN)
# ========================
/automotive/google-ads /en/automotive/google-ads 301
/automotive/paid-social /en/automotive/paid-social 301
/automotive/facebook-dynamic-ads /en/automotive/facebook-dynamic-ads 301

# ========================
# AUTOMOTIVE (FR)
# ========================
/fr/automotive/google-ads /fr/automotive/google-ads 200
/fr/automotive/paid-social /fr/automotive/paid-social 200
/fr/automotive/facebook-dynamic-ads /fr/automotive/facebook-dynamic-ads 200

# ========================
# BLOG LIST
# ========================
/blogs /en/blog 301
/fr/blogs /fr/blog 301

# ========================
# BLOG ARTICLES (EN)
# ========================
/blog/abm-deck /en/blog/abm-deck 301
/blog/beware-of-scammers /en/blog/beware-of-scammers 301
/blog/facebook-dynamic-ads-for-automotive-dealers /en/blog/facebook-dynamic-ads-automotive 301
/blog/google-consent-mode-v2 /en/blog/google-consent-mode-v2 301
/blog/how-people-really-use-chatgpt /en/blog/how-to-rank-on-chatgpt 301
/blog/how-to-rank-on-chatgpt /en/blog/how-to-rank-on-chatgpt 301
/blog/how-to-train-teams-on-ai /en/blog/how-to-train-teams-on-ai 301
/blog/intent-data-in-b2b-marketing /en/blog/intent-data-b2b-marketing 301
/blog/marketing-automation-tools /en/blog/marketing-automation-tools 301
/blog/mydigipal-cx-ninjas-guide-to-partner-marketing /en/blog/partner-marketing-guide 301
/blog/mydigipal-podcast-1-whats-wrong-with-your-abm /en/blog/podcast-abm 301
/blog/open-source-ai-agents /en/blog/open-source-ai-agents 301
/blog/revolutionizing-b2b-marketing-with-abm /en/blog/revolutionizing-b2b-with-abm 301
/blog/successful-linkedin-strategy /en/blog/successful-linkedin-strategy 301

# ========================
# BLOG ARTICLES (FR)
# ========================
/fr/blog/abm-deck /fr/blog/abm-deck 301
/fr/blog/beware-of-scammers /fr/blog/beware-of-scammers 301
/fr/blog/facebook-dynamic-ads-for-automotive-dealers /fr/blog/facebook-dynamic-ads-automotive 301
/fr/blog/google-consent-mode-v2 /fr/blog/google-consent-mode-v2 301
/fr/blog/how-people-really-use-chatgpt /fr/blog/how-to-rank-on-chatgpt 301
/fr/blog/how-to-rank-on-chatgpt /fr/blog/how-to-rank-on-chatgpt 301
/fr/blog/how-to-train-teams-on-ai /fr/blog/how-to-train-teams-on-ai 301
/fr/blog/intent-data-in-b2b-marketing /fr/blog/intent-data-b2b-marketing 301
/fr/blog/marketing-automation-tools /fr/blog/marketing-automation-tools 301
/fr/blog/mydigipal-cx-ninjas-guide-to-partner-marketing /fr/blog/partner-marketing-guide 301
/fr/blog/mydigipal-podcast-1-whats-wrong-with-your-abm /fr/blog/podcast-abm 301
/fr/blog/open-source-ai-agents /fr/blog/open-source-ai-agents 301
/fr/blog/revolutionizing-b2b-marketing-with-abm /fr/blog/revolutionizing-b2b-with-abm 301
/fr/blog/successful-linkedin-strategy /fr/blog/successful-linkedin-strategy 301

# ========================
# CASE STUDIES LIST
# ========================
/case-studies /en/case-studies 301
/fr/case-studies /fr/case-studies 200

# ========================
# CASE STUDY CATEGORIES (Redirect to main list)
# ========================
/case-study-categories/* /en/case-studies 301
/fr/case-study-categories/* /fr/case-studies 301

# ========================
# CASE STUDIES (EN)
# ========================
/case-study/abm-from-scratch-to-the-cloud /en/case-studies/quantum-metrics 301
/case-study/dmd /en/case-studies/dmd-group 301
/case-study/genesys-revamping-abm /en/case-studies/genesys 301
/case-study/gwi-paid-media-success /en/case-studies/gwi 301
/case-study/symbl-digital-marketing-introduction /en/case-studies/symbl-ai 301
/case-study/theobald /en/case-studies/theobald-group 301
/case-study/vulcain-group-increased-digital-strategy /en/case-studies/vulcain-group 301

# ========================
# CASE STUDIES (FR)
# ========================
/fr/case-study/abm-from-scratch-to-the-cloud /fr/case-studies/quantum-metrics 301
/fr/case-study/dmd /fr/case-studies/dmd-group 301
/fr/case-study/genesys-revamping-abm /fr/case-studies/genesys 301
/fr/case-study/gwi-paid-media-success /fr/case-studies/gwi 301
/fr/case-study/symbl-digital-marketing-introduction /fr/case-studies/symbl-ai 301
/fr/case-study/theobald /fr/case-studies/theobald-group 301
/fr/case-study/vulcain-group-increased-digital-strategy /fr/case-studies/vulcain-group 301

# ========================
# OTHER PAGES
# ========================
/contact-us /en/contact 301
/fr/contact-us /fr/contact 301
/our-team /en 301
/fr/our-team /fr 301
```

---

## 5. SEO Meta Tags Audit

### Current Meta Tags Status

Run this audit before launch:

```bash
# Check all pages have meta titles and descriptions
npm run build
grep -r "og:title" dist/ | wc -l
grep -r "og:description" dist/ | wc -l
```

### Required Meta Tags per Page

Each page should have:
- `<title>` - Unique, 50-60 characters
- `<meta name="description">` - Unique, 150-160 characters
- `<meta property="og:title">` - Same as title
- `<meta property="og:description">` - Same as description
- `<meta property="og:image">` - 1200x630px image
- `<link rel="canonical">` - Canonical URL
- `<link rel="alternate" hreflang="en">` - EN version
- `<link rel="alternate" hreflang="fr">` - FR version

### Pages to Audit

| Page | Title | Description | OG Image |
|------|-------|-------------|----------|
| Home EN | ⬜ Check | ⬜ Check | ⬜ Check |
| Home FR | ⬜ Check | ⬜ Check | ⬜ Check |
| Services (all) | ⬜ Check | ⬜ Check | ⬜ Check |
| Blog articles | ⬜ Check | ⬜ Check | ⬜ Check |
| Case studies | ⬜ Check | ⬜ Check | ⬜ Check |
| Automotive | ⬜ Check | ⬜ Check | ⬜ Check |

---

## 6. LLMs.txt Implementation

### What is llms.txt?

A `llms.txt` file helps Large Language Models understand your website and provide accurate information about your company when users ask questions.

### File Location
`public/llms.txt`

### Content Template

```
# MyDigipal

> AI-powered international digital marketing agency specializing in B2B & B2C marketing.

## Company Overview

MyDigipal is a digital marketing agency founded by Paul Arnoux, specializing in:
- Google Ads & PPC Management
- Paid Social Media Advertising
- SEO Optimization
- Email Marketing
- AI Training for Teams
- Custom AI Solutions
- Account-Based Marketing (ABM)

## Industries Served

### B2B Technology
We work with enterprise software companies on ABM strategies, paid media, and marketing automation.

### Automotive
Specialized digital marketing for car dealerships including:
- Google Ads for new and used vehicle inventory
- Facebook Dynamic Ads for automotive
- Social media marketing

## Services

### Google Ads
Expert PPC management with focus on ROI optimization, smart bidding strategies, and conversion tracking.

### Paid Social
Strategic advertising on Facebook, Instagram, LinkedIn, and TikTok with advanced audience targeting.

### SEO
Comprehensive SEO including technical optimization, content strategy, and AI-enhanced keyword research.

### Email Marketing
Full-service email campaigns including automation, personalization, and performance analytics.

### AI Training
Corporate training programs to help teams leverage AI tools effectively in their workflows.

### AI Solutions
Custom AI development including chatbots, workflow automation, and marketing intelligence tools.

## Key Metrics

- 50+ Happy Clients
- 12+ Industries Served
- 8+ Countries
- Offices in Paris, France

## Contact

- Website: https://mydigipal.com
- Email: hello@mydigipal.com
- LinkedIn: https://linkedin.com/company/mydigipal

## Team

Paul Arnoux - Founder & CEO
Jordan Langlois - Digital Marketing Manager
Alexandre Echement - Digital Marketing Manager
Juliette Joire - Digital Marketing Executive

## Case Studies

Notable clients include:
- Genesys (ABM & Paid Media)
- Quantum Metrics (ABM Strategy)
- DMD Group (Automotive Marketing)
- GWI (Paid Media)
- Theobald Group (Automotive)
- Vulcain Group (Automotive)
- Symbl.ai (Digital Marketing)
```

---

## 7. Security Configuration

### 7.1 HTTPS Configuration

Render automatically provides HTTPS via Let's Encrypt. Ensure:
- [ ] Custom domain has SSL certificate
- [ ] HTTP to HTTPS redirect is enabled
- [ ] HSTS header is configured

### 7.2 Security Headers

Add to `astro.config.mjs` or create `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 7.3 Additional Security Measures

1. **robots.txt** - Already exists, verify it's correct
2. **No sensitive data exposure** - Verify no API keys in client code
3. **Form validation** - Contact form should validate inputs
4. **Rate limiting** - Configure on Render if needed

### 7.4 Checklist

- [ ] SSL/TLS certificate active
- [ ] HTTPS redirect working
- [ ] Security headers configured
- [ ] No mixed content warnings
- [ ] robots.txt verified
- [ ] sitemap.xml generates correctly
- [ ] No exposed API keys

---

## 8. DNS & Hosting Switch

### 8.1 Current Setup

- **Webflow Hosting:** www.mydigipal.com
- **DNS Provider:** [Check current provider]

### 8.2 Target Setup

- **Render Hosting:** mydigipal.com
- **DNS Provider:** Same or Cloudflare (recommended)

### 8.3 Migration Steps

#### Pre-Migration (1 week before)
1. [ ] Reduce DNS TTL to 300 seconds (5 minutes)
2. [ ] Test new site thoroughly on mydigipal-website.onrender.com
3. [ ] Verify all redirects work
4. [ ] Backup Webflow site export

#### Migration Day
1. [ ] Final build on Render
2. [ ] Add custom domain in Render Dashboard
3. [ ] Update DNS records:
   ```
   A Record: mydigipal.com → [Render IP]
   CNAME: www.mydigipal.com → mydigipal.com
   ```
4. [ ] Wait for DNS propagation (5-30 minutes)
5. [ ] Verify SSL certificate is active
6. [ ] Test all critical pages
7. [ ] Test all 301 redirects

#### Post-Migration
1. [ ] Monitor Google Search Console for crawl errors
2. [ ] Check Google Analytics for traffic drops
3. [ ] Submit new sitemap to Google
4. [ ] Increase DNS TTL back to 3600+ seconds
5. [ ] Keep Webflow active for 30 days (backup)
6. [ ] Cancel Webflow subscription after 30 days

### 8.4 Rollback Plan

If issues occur:
1. Revert DNS to Webflow IP
2. DNS propagation: 5-30 minutes
3. Site will be back on Webflow

---

## 9. Pre-Launch Checklist

### Content
- [ ] All service pages have content
- [ ] All blog articles migrated
- [ ] All case studies migrated
- [ ] Images optimized
- [ ] No broken internal links
- [ ] No 404 pages

### SEO
- [ ] All pages have unique meta titles
- [ ] All pages have unique meta descriptions
- [ ] OG images set for all pages
- [ ] Canonical URLs correct
- [ ] Hreflang tags correct
- [ ] sitemap.xml generates correctly
- [ ] robots.txt verified
- [ ] llms.txt created

### Functionality
- [ ] Contact form works
- [ ] Calculator works
- [ ] Newsletter signup works
- [ ] Language switcher works
- [ ] Mobile responsive
- [ ] All links working

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Images lazy loaded
- [ ] CSS/JS minified

### Security
- [ ] HTTPS active
- [ ] Security headers set
- [ ] No console errors
- [ ] No mixed content

### Redirects
- [ ] _redirects file created
- [ ] All old URLs tested
- [ ] www to non-www redirect works

---

## 10. Post-Launch Monitoring

### Day 1
- [ ] Check uptime
- [ ] Monitor 404 errors
- [ ] Check Google Search Console
- [ ] Verify Google Analytics tracking

### Week 1
- [ ] Monitor organic traffic
- [ ] Check for crawl errors
- [ ] Review 301 redirect logs
- [ ] Fix any broken links

### Month 1
- [ ] Compare traffic before/after
- [ ] Check keyword rankings
- [ ] Review Core Web Vitals
- [ ] Cancel Webflow if all good

---

## Action Items Summary

### Immediate (Before Migration)
1. Create `public/_redirects` file
2. Create `public/llms.txt` file
3. Create `public/_headers` file
4. Audit all meta tags
5. Decide on missing pages (create or redirect)

### Migration Day
1. Reduce DNS TTL
2. Add custom domain in Render
3. Update DNS records
4. Verify everything works

### Post-Migration
1. Monitor for errors
2. Submit sitemap
3. Keep Webflow 30 days
4. Cancel Webflow

---

*Document maintained by: Claude AI Assistant*
*Last updated: 31 December 2024*

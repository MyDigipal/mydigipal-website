# Audit et Refonte du Calculateur MyDigipal

> Date : 15 février 2026
> Auteur : Claude (audit automatisé)
> Statut : Implémenté (v5 - data + types + translations + Calculator.tsx)

---

## 1. État avant refonte

### Structure technique
- **Composant principal** : `src/components/calculator/Calculator.tsx` (2045 lignes, monolithique)
- **Stack** : React Island dans Astro, Tailwind CSS, useState/useMemo natifs
- **Webhook** : N8N (`https://n8n.mydigipal.com/webhook/calculateur-marketing`)
- **Anti-spam** : Honeypot + timer 3s + math challenge

### 7 domaines de services (avant)

| Domaine | Sous-services | Problème |
|---------|--------------|----------|
| SEO | 5 (Audit, Corrections, Stratégie, Contenu IA, Suivi) | Trop granulaire |
| Google Ads | 2 (Audit, Setup) + slider budget | OK |
| Paid Social | 3 (Audit, Setup, Visuels) + slider budget | Manque canaux, feed |
| Email Marketing | 7 (Setup, CRM, Segmentation, Contacts, Contenu, Campagnes, Analytics) | Beaucoup trop |
| AI Training | Demi-journée / Journée (1 ou 5+ sessions) | OK |
| AI Solutions | Formulaire de devis seulement | Trop vague |
| Tracking & Reporting | 5 services + audit | OK |

### Pricing constaté (avant)
- SEO : 200-1750€/mois (calculateur) vs 300-1200€/mois (propositions réelles)
- Google Ads management : 500€ flat ou 15-20% vs 300-1000€/mois (propositions)
- Paid Social management : idem Google Ads
- Email Marketing : 100-2500€/mois
- AI Training : 1150-2800€/session (bien positionné)
- Tracking : 300-600€ par service (one-off)

### Benchmark concurrentiel
- Médiane marché PME SEO : 2500-5000$/mois (~2300-4600€)
- Médiane marché PME PPC : 2000-3000$/mois (~1850-2750€)
- Médiane marché PME Social : 1500-3000$/mois (~1400-2750€)
- Sources : Upgrow, LYFE Marketing, WebFX, HawkSEM, Connective Web Design

### Services vendus dans les propositions mais ABSENTS du calculateur
1. **TikTok Ads** (vendu à Atelier PG)
2. **LinkedIn Stratégie Organique** (vendu à Fabien, Puma Safety)
3. **Chatbot IA** (vendu à Fabien, Puma Safety - 500-800€)
4. **Flux/Feed Management** (vendu à Kroely - 420€ setup + 75€/mois)
5. **AI Content Creation** (service page existante mais pas dans calculateur)

---

## 2. Plan de refonte

### Nouvelles catégories (8 domaines, était 7)

1. **SEO** - 3 packages (Starter / Growth / Premium) au lieu de 5 sous-services
2. **Google Ads** - Gardé tel quel (audit + setup + slider budget + tiered fees)
3. **Paid Social** - Refonte : sélection de canaux (Meta, LinkedIn, TikTok) + option "aidez-moi à choisir" + Feed/Catalogue
4. **AI Content Creation** - NOUVEAU (Blog, Landing Pages, Social Posts, packages mensuels)
5. **Email Marketing** - 3 packages (Setup Only / Campaign Management / Full Service) au lieu de 7
6. **AI Solutions** - Packages concrets (Chatbot IA, Workflow Automation, Agent Custom, Maintenance)
7. **AI Training** - Gardé tel quel
8. **Tracking & Reporting** - Gardé tel quel

### Améliorations UX planifiées
- Stepper de progression visuel (3 étapes)
- Panneau latéral sticky pour le résumé (au lieu du popup)
- Option "guidé" pour les prospects qui ne savent pas ce dont ils ont besoin
- Animations d'entrée et transitions fluides
- Palette rationalisée (indigo + gold #C8A951)

### Améliorations design planifiées
- Thème sombre cohérent avec app.mydigipal.com (gradient #0B0B1A → #1a1a36)
- Glassmorphism (bg-white/5, backdrop-blur-xl)
- Icônes SVG au lieu des emojis
- Typographie Space Grotesk (titres) + Inter (corps)

---

## 3. Notes d'implémentation

### Tâche 1 : Simplifier Email Marketing (7→3)

**Avant** : 7 sous-services (Setup, CRM, Segmentation, Contacts, Contenu, Campagnes, Analytics)
**Après** : 3 packages

| Package | Prix | Inclus |
|---------|------|--------|
| Setup & Configuration | 500-1500€ one-off | Config plateforme + DNS + CRM + Segmentation + Formation |
| Campaign Management | 500-1200€/mois | Contenu + Envoi + A/B testing + Analytics + Reporting |
| Full Service | 1500-2500€/mois | Setup inclus + Management + Acquisition contacts + Stratégie complète |

**Fichier modifié** : `src/components/calculator/data/emailing-services.ts`

### Tâche 2 : Simplifier SEO (5→3)

**Avant** : 5 sous-services (Audit, Corrections, Stratégie, Contenu, Suivi)
**Après** : 3 packages

| Package | Prix mensuel | Inclus |
|---------|-------------|--------|
| Starter | 400-600€/mois | Audit initial + Corrections + 2 articles/mois + Reporting email |
| Growth | 800-1200€/mois | Stratégie SEO + 4 articles/mois + Meeting bi-mensuel + Corrections continues |
| Premium | 1500-2000€/mois | Stratégie complète + 8 articles + Netlinking + Meeting mensuel + Accompagnement dédié |

**Fichier modifié** : `src/components/calculator/data/seo-services.ts`

### Tâche 3 : Restructurer AI Solutions

**Avant** : Formulaire de qualification uniquement
**Après** : 4 packages concrets + formulaire custom

| Package | Prix | Description |
|---------|------|-------------|
| Chatbot IA | 2000-5000€ | Agent conversationnel sur documentation, FAQ, support client |
| Workflow Automation | 1500-4000€ | Automatisation n8n/Make/Zapier de processus métier |
| AI Agent Custom | Sur devis | Agent complexe multi-outils, intégrations API avancées |
| Maintenance IA | 200-500€/mois | Support, mises à jour, évolutions des solutions existantes |

**Fichier modifié** : `src/components/calculator/data/ai-solutions-questions.ts`

### Tâche 4 : Ajouter AI Content Creation

**Nouveau domaine** basé sur la page /en/services/ai-content

| Package | Prix mensuel | Inclus |
|---------|-------------|--------|
| Starter | 400-600€/mois | 2-4 articles blog SEO + Brand voice training |
| Growth | 800-1200€/mois | 4-8 articles + Social posts + Landing pages |
| Premium | 1500-2500€/mois | Contenu illimité + Case studies + Email sequences + Publication CMS |

**Nouveau fichier** : `src/components/calculator/data/ai-content-services.ts`

### Tâche 5 : Reworker Paid Social avec canaux

**Avant** : Audit + Setup + Visuels (même structure pour tous les canaux)
**Après** : Sélection de canaux individuels

Flow :
1. L'utilisateur choisit "Paid Social"
2. Deux options :
   - "Je sais quels canaux" → Sélection : Meta, LinkedIn, TikTok, Google Display
   - "Aidez-moi à choisir" → Formulaire court
3. Pour chaque canal sélectionné :
   - Budget slider individuel
   - Frais de gestion tiered
4. Add-ons transversaux :
   - Feed/Catalogue Management (setup 400-800€ + 75-200€/mois)
   - Création de visuels (300-1200€/mois)
   - Audit multi-canal (300-500€ one-off)

**Fichiers modifiés** : `paid-social-services.ts`, `types.ts`, `Calculator.tsx`

---

## 4. Fichiers impactés

| Fichier | Type de changement |
|---------|-------------------|
| `data/seo-services.ts` | Refonte complète (5→3 packages) |
| `data/emailing-services.ts` | Refonte complète (7→3 packages) |
| `data/ai-solutions-questions.ts` | Restructuration (ajout packages concrets) |
| `data/ai-content-services.ts` | NOUVEAU fichier |
| `data/paid-social-services.ts` | Refonte (ajout canaux, feed) |
| `data/index.ts` | Ajout du nouveau domaine ai-content, mise à jour configs |
| `types.ts` | Ajout ServiceDomain 'ai-content', types canaux |
| `translations.ts` | Ajout traductions nouveaux services |
| `Calculator.tsx` | Modifications UI/UX majeures |

---

## 5. Historique des modifications

| Date | Changement | Fichier(s) |
|------|-----------|------------|
| 15/02/2026 | Début de l'audit et de la refonte | Tous |
| 15/02/2026 | Email Marketing : 7→3 packages | `emailing-services.ts` |
| 15/02/2026 | SEO : 5→2 services (Audit + Monthly) | `seo-services.ts` |
| 15/02/2026 | AI Solutions : ajout 3 packages concrets + formulaire custom | `ai-solutions-questions.ts` |
| 15/02/2026 | AI Content Creation : nouveau domaine (Blog + Social) | `ai-content-services.ts` (NEW) |
| 15/02/2026 | Paid Social : ajout Feed/Catalogue + socialChannels | `paid-social-services.ts` |
| 15/02/2026 | Types : ajout 'ai-content' + Currency types | `types.ts` |
| 15/02/2026 | Index : enregistrement ai-content, export aiSolutionsServices, socialChannels, CURRENCY_CONFIGS | `data/index.ts` |
| 15/02/2026 | Translations : nouvelles clés AI Content, AI Solutions, Currency, Social Channels | `translations.ts` |
| 15/02/2026 | Calculator.tsx : AI Solutions avec packages, couleur pink, sélecteur de devise EUR/USD/GBP, fp() pour prix, version v5 | `Calculator.tsx` |

---

## 6. Sélecteur de devise

Implémenté dans Calculator.tsx v5.

| Devise | Symbole | Taux (depuis EUR) |
|--------|---------|-------------------|
| EUR | € | 1.00 |
| USD | $ | 1.08 |
| GBP | £ | 0.86 |

- Le sélecteur apparaît sur la page de sélection des domaines et dans la barre sticky
- Tous les prix sont affichés via `fp()` (formatPrice) qui convertit automatiquement
- Les prix stockés et envoyés au webhook restent en EUR (conversion côté affichage seulement)
- La devise sélectionnée est incluse dans le payload webhook (`currency` field)

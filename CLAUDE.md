# MyDigipal Website - Site Astro + Calculateur React

## 1. Vue d'ensemble

| Clé | Valeur |
|-----|--------|
| Stack | Astro 5 (static build, ~14s) + React islands |
| Calculateur | `/en/calculator` et `/fr/calculator` (React island) |
| Webhook | `https://n8n.mydigipal.com/webhook/calculateur-marketing` |
| Build | `npm run build` |
| Déploiement | TOUJOURS commit + push après un build réussi, sans demander |

## 2. SEO - Règles obligatoires

### Balises title
- La balise `<title>` est construite automatiquement : `{titre frontmatter} | MyDigipal` (13 caractères pour le suffixe)
- Le titre total doit faire entre **50 et 60 caractères** (donc `seo.title` entre 37 et 47 caractères)
- Ne JAMAIS inclure "| MyDigipal" dans le titre frontmatter (ajouté par BaseLayout.astro)
- Si le titre d'affichage doit être plus long, utiliser le champ `seo.title` pour le titre court SEO

### Meta descriptions
- **145-160 caractères**, inclure mots-clés principaux et appel à l'action
- Utiliser `seo.description` si la description d'affichage est trop longue

### Frontmatter blog - Champs SEO optionnels
```yaml
seo:
  title: "Titre court SEO 37-47 car."
  description: "Description 145-160 car."
  image: "/images/og-image.png"
```

### Liens internes
- Toujours pointer vers l'URL finale, jamais vers une URL qui redirige
- Pas de trailing slash (config Astro : `trailingSlash: 'never'`)
- Image blog : 1200x630px

## 3. Architecture du calculateur (v5)

### Fichiers principaux
- **Composant** : `src/components/calculator/Calculator.tsx` (~2200 lignes)
- **Data** : 8 fichiers dans `data/` (seo, google-ads, paid-social, emailing, ai-training, ai-solutions, ai-content, tracking-reporting)
- **Config centrale** : `data/index.ts` - domainConfigs, BUDGET_CONFIG, DURATION_CONFIG, MANAGEMENT_FEE_CONFIG, CURRENCY_CONFIGS
- **Types** : `types.ts` - ServiceDomain (8 domaines incluant 'ai-content'), Currency ('EUR' | 'USD' | 'GBP')
- **Traductions** : `translations.ts` - clés EN/FR, fonction `t()`
- **Docs** : `docs/calculator/CALCULATOR-AUDIT.md`

### Patterns importants
- Prix affichés via `fp()` (formatPrice) pour support multi-devises
- Les prix restent en EUR dans le code, conversion côté affichage seulement
- AI Solutions a des packages concrets + formulaire custom (showAiCustomForm)
- Paid Social a `socialChannels` export pour la sélection de canaux

## 4. Mode guide conversationnel (v1)

### Fichiers
- `GuidedMode.tsx` (chat UI), `guided-data.ts` (questions + scoring)
- Intégration : step `'guided'` dans Calculator.tsx, avant la sélection manuelle

### Logique
- 5 questions : industrie, objectifs (multi), budget (slider), efforts actuels (multi), contexte libre
- Scoring : pertinence industrie (0-1) + boost objectifs (+0.2 à +0.5) - seuil inclusion > 0.6
- Contrainte budget : max 3 domaines si <=1500 EUR, max 5 si <=3000 EUR
- Mapping budget vers niveaux : <=1500 EUR = Starter, 1500-4000 EUR = Growth, >4000 EUR = Premium

### Référence business : Propale ControlAI
- 7+1 canaux : Meta, Reddit, Google, LinkedIn, YouTube, TikTok, Display, Community Management
- 3 packs : Essentials (£4-5.3K/mois), Growth (£9.6-12.8K/mois), Impact (£15.5-20.1K/mois)
- Évolution : Mois 1-2 Essentials, Mois 3-4 Growth, Mois 5-6 Impact

## 5. Bugs corrigés (à retenir)
- `handleGuidedComplete` : les clés de sélection doivent être `service.id` seul, PAS `${domainId}-${service.id}`
- `budgetActivated` : activer pour tout domaine ads recommandé (pas seulement si budget > 500)

## 6. Améliorations futures (mode guide)
1. Ajouter les canaux sociaux spécifiques (Reddit, TikTok, LinkedIn) dans les recommandations
2. Intégrer la notion de "chemin d'évolution" (starter vers growth vers impact)
3. Ajouter community management comme option
4. Enrichir le reasoning avec des benchmarks réels (CPM, CPC, CTR)
5. Ajouter des cas d'usage par industrie
6. Proposer Google Ad Grants pour les organisations éligibles

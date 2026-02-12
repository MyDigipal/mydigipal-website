# Instructions projet

## Langue française - OBLIGATOIRE
Toujours utiliser les accents français corrects dans TOUS les documents générés (HTML, MD, CSV, texte, etc.).
Accents obligatoires : é è ê ë à â ù û ô î ï ç (système, problème, dépense, détecté, déploiement, sécurité, générée, créé, résultat, concrètement, contrôle, où, ça, reçu, déjà, voilà).
Ne JAMAIS écrire de français sans accents.

## SEO - Règles obligatoires pour la création de contenu

### Balises title
- La balise `<title>` est construite automatiquement : `{titre frontmatter} | MyDigipal` (13 caractères pour le suffixe)
- Le titre frontmatter (ou `seo.title`) doit faire **≤47 caractères** pour un total ≤60 caractères
- Ne JAMAIS inclure "| MyDigipal" dans le titre frontmatter (il est ajouté par BaseLayout.astro)
- Si le titre d'affichage doit être plus long, utiliser le champ `seo.title` pour le titre court SEO

### Meta descriptions
- La meta description doit faire **120-155 caractères** (ni trop courte, ni trop longue)
- Utiliser le champ `seo.description` dans le frontmatter si la description d'affichage est trop longue
- Inclure les mots-clés principaux et un appel à l'action

### Frontmatter blog - Champs SEO optionnels
```yaml
seo:
  title: "Titre court SEO ≤47 car."      # Override pour la balise <title>
  description: "Description 120-155 car."  # Override pour la meta description
  image: "/images/og-image.png"            # Override pour l'image OG
```

### Liens internes
- Toujours pointer vers l'URL finale, jamais vers une URL qui redirige
- Exemple : utiliser `https://app.mydigipal.com/login` et non `https://app.mydigipal.com/` (qui fait un 307)
- Vérifier que les liens internes n'ont pas de trailing slash (configuration Astro : `trailingSlash: 'never'`)

### Open Graph et Twitter Cards
- Gérés automatiquement par BaseLayout.astro si `title`, `description` et `image` sont définis dans le frontmatter
- Toujours fournir une image de dimensions 1200x630px pour les articles de blog

### Vérifications avant publication
- [ ] Titre total (avec " | MyDigipal") ≤ 60 caractères
- [ ] Meta description entre 120 et 155 caractères
- [ ] Tous les accents français corrects
- [ ] Image de blog fournie (1200x630)
- [ ] Liens internes pointent vers les URLs finales (pas de redirections)

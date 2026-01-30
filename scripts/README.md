# MyDigipal SEO Scripts

Scripts pour la soumission d'URLs aux moteurs de recherche.

## IndexNow (Bing, Yandex, Seznam, Naver)

IndexNow permet de notifier instantanément les moteurs de recherche quand une page change.

### Usage

```bash
# Soumettre toutes les URLs du sitemap
node scripts/indexnow.js

# Soumettre une seule URL
node scripts/indexnow.js --url https://mydigipal.com/en/services/seo

# Soumettre depuis un fichier (une URL par ligne)
node scripts/indexnow.js --file urls.txt

# Preview sans soumettre
node scripts/indexnow.js --dry-run
```

### Configuration

- **Clé API** : `69a67a739e033bbad818c0097069a97b`
- **Fichier de vérification** : `public/69a67a739e033bbad818c0097069a97b.txt`
- **URL de vérification** : `https://mydigipal.com/69a67a739e033bbad818c0097069a97b.txt`

---

## Google Search Console

Script pour soumettre des URLs à Google pour indexation.

### Usage

```bash
# Lister toutes les URLs du sitemap
node scripts/google-indexing.js

# Sauvegarder la liste dans un fichier
node scripts/google-indexing.js --output urls.txt

# Soumettre via l'API (nécessite credentials)
node scripts/google-indexing.js --api

# Soumettre une seule URL via l'API
node scripts/google-indexing.js --api --url https://mydigipal.com/en/blog/example
```

### Configuration API (optionnel)

Pour utiliser le mode `--api`, vous devez configurer les credentials Google Cloud :

1. **Google Cloud Console** : https://console.cloud.google.com/
2. **Activer l'API Indexing** : APIs & Services > Library > "Indexing API" > Enable
3. **Créer un Service Account** :
   - IAM & Admin > Service Accounts > Create Service Account
   - Donner un nom (ex: "indexing-bot")
   - Create and Continue > Done
4. **Créer une clé JSON** :
   - Cliquer sur le service account créé
   - Keys > Add Key > Create new key > JSON
   - Sauvegarder le fichier comme `scripts/google-credentials.json`
5. **Ajouter dans Search Console** :
   - Google Search Console > Settings > Users and permissions
   - Add user > Coller l'email du service account
   - Permission: Owner

### Limites

- **IndexNow** : Pas de limite stricte, mais éviter le spam
- **Google Indexing API** : 200 requêtes par jour

### Méthodes alternatives

1. **Sitemap Ping** (automatique avec le script) :
   ```
   https://www.google.com/ping?sitemap=https://mydigipal.com/sitemap.xml
   ```

2. **Search Console UI** :
   - URL Inspection > Enter URL > Request Indexing

3. **Soumettre le sitemap** :
   - Search Console > Sitemaps > Add sitemap

---

## Exécution après déploiement

Après chaque déploiement avec des changements de contenu :

```bash
# 1. Notifier IndexNow (Bing, Yandex, etc.)
node scripts/indexnow.js

# 2. Ping Google avec le sitemap (inclus dans google-indexing.js)
node scripts/google-indexing.js
```

Pour automatiser, vous pouvez ajouter ces commandes dans votre pipeline CI/CD après le déploiement.

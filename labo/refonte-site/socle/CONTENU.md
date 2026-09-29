# Contenu de la page type : Google Ads (FR et EN)

Page type des trois directions de la refonte. Même contenu dans les trois maquettes : seuls la
palette, les polices, le rythme et le traitement des animations changent.

Règles de contenu, non négociables :

- **Aucun chiffre écrit à la main.** Les seuls chiffres de la page viennent des études de cas du
  site (`src/content/case-studies/`), recopiés ci-dessous avec leur source. Les anciens chiffres
  des sections Google Ads (« 8.5B », « 65% », « 200% », « 3M+ », « 90% »...) n'ont pas de source
  et ne sont PAS repris.
- Français en casse de phrase, avec tous ses accents. Espace insécable avant `%`, `?`, `:`, `;`,
  `!` en français (`&nbsp;`). Aucun tiret cadratin ni demi-cadratin. Aucun tiret utilisé comme
  conjonction. Aucun emoji.
- Anglais britannique soigné, sans espace avant `%`.
- Les deux langues sont dans le HTML : `<span lang="fr">…</span><span lang="en">…</span>`, ou deux
  blocs frères qui portent `lang`. `html[data-langue]` décide de celle qui s'affiche
  (`socle/socle.css`).

Chemins des images : relatifs à la maquette, `../../public/images/...`.

---

## En-tête (celui du site, à reproduire fidèlement)

Logo : `../../public/images/Logos/MyDigipal Logo_Full Main.png` (fond clair),
`../../public/images/Logos/03_Full white.png` (fond sombre). Hauteur 32 px. Jamais redessiné.

| FR | EN | Lien |
|---|---|---|
| Services | Services | `#` |
| IA | AI | `#` |
| Automobile | Automotive | `#` |
| Études de cas | Case Studies | `#` |
| Blog | Blog | `#` |
| Espace client | Client Login | `#` |
| Contact | Contact | `#` |
| Calculer mon budget | Calculate my budget | bouton principal |
| EN | FR | bascule de langue (texte, pas de drapeau) |

Sous 1024 px : logo à gauche, bouton de menu à droite (icône en SVG), rien d'autre.

## 1. Hero

| | FR | EN |
|---|---|---|
| Rubrique | Google Ads | Google Ads |
| H1 | Dominez les résultats de recherche instantanément | Dominate search results instantly |
| Texte | Une gestion Google Ads fondée sur la mesure, pas sur l'intuition. Campagnes Search, Performance Max et YouTube revues chaque semaine, sans boîte noire. | Google Ads management built on measurement, not guesswork. Search, Performance Max and YouTube campaigns reviewed every week, with no black-box reporting. |
| Bouton 1 | Calculer mon budget | Calculate my budget |
| Bouton 2 | Nous contacter | Contact us |

Un seul H1 par page. Les deux boutons restent côte à côte, y compris à 390 px (jamais empilés).

Résultats de clients, à côté ou sous le texte (source : études de cas) :

| Valeur FR | Valeur EN | Libellé FR | Libellé EN | Client FR | Client EN |
|---|---|---|---|---|---|
| +112&nbsp;% | +112% | conversions Google Ads | Google Ads conversions | Groupe Théobald | Theobald Group |
| -35&nbsp;% | -35% | coût par lead | cost per lead | Groupe Vulcain | Vulcain Group |
| +225&nbsp;% | +225% | utilisateurs Google Ads | Google Ads users | Groupe DMD | DMD Group |

## 2. Bandeau des logos

Titre discret : FR « Ils nous confient leurs campagnes » / EN « They trust us with their campaigns ».

Vrais logos, dans `../../public/images/accueil/logos/` : `theobald.webp`, `vulcain.webp`,
`dmd.webp`, `bymycar.webp`, `ford.webp`, `motork.webp`, `genesys.webp`, `opentext.webp`,
`edenred.webp`, `gwi.webp`, `symbl.webp`, `quantum.webp`.
Texte alternatif : le nom de la marque. Aucun libellé sous un logo. Hauteur visuelle égale
(28 à 34 px), en niveaux de gris ou tels quels selon la direction. Sur fond sombre, vérifier que
chaque logo reste lisible (sinon le poser sur une pastille claire, tous de la même façon).
Interdits : Kering, Chanel.

## 3. L'explication : comment marche une campagne Performance Max

C'est LA section de la page : la notion difficile, expliquée par l'animation principale.
Une idée forte : **Google choisit où montrer l'annonce. Nous choisissons ce qu'il apprend.**

| | FR | EN |
|---|---|---|
| Titre (H2) | Comment marche une campagne Performance Max | How a Performance Max campaign works |
| Chapeau | Vous donnez à Google des éléments et un objectif. Son IA compose les annonces et choisit où les montrer. Notre travail se joue avant et après&nbsp;: ce qu'on lui donne, puis ce qu'on lui apprend. | You give Google a set of assets and a goal. Its AI assembles the ads and decides where to show them. Our work happens before and after: what we feed it, then what we teach it. |

Les trois temps de l'animation (trois tenues, trois repères cliquables) :

| Temps | Titre FR | Titre EN | Texte FR | Texte EN |
|---|---|---|---|---|
| 1 | Ce qu'on lui donne | What we feed it | Des titres, des descriptions, des images, des vidéos, votre flux de produits ou de véhicules, et des signaux d'audience. Plus la matière est juste, mieux la machine travaille. | Headlines, descriptions, images, videos, your product or vehicle feed, and audience signals. The better the material, the better the machine works. |
| 2 | Ce que Google décide | What Google decides | L'assemblage de chaque annonce, l'enchère et l'emplacement. La même campagne se montre sur six réseaux, selon la personne et le moment. | How each ad is assembled, the bid and the placement. The same campaign shows across six networks, depending on the person and the moment. |
| 3 | Ce qu'on lui apprend | What we teach it | Quelles conversions comptent vraiment&nbsp;: un lead qualifié, une vente, un essai en concession. Nous les faisons remonter depuis votre CRM, et nous excluons ce qui ne doit pas être acheté. | Which conversions really matter: a qualified lead, a sale, a test drive. We send them back from your CRM, and we exclude what should not be bought. |

Étiquettes dans le dessin :

| Groupe | FR | EN |
|---|---|---|
| Entrées | Titres · Descriptions · Images · Vidéos · Flux produits · Signaux d'audience | Headlines · Descriptions · Images · Videos · Product feed · Audience signals |
| Centre | Performance Max | Performance Max |
| Réseaux (six, dans cet ordre) | Search · YouTube · Display · Discover · Gmail · Maps | Search · YouTube · Display · Discover · Gmail · Maps |
| Retours | Lead qualifié · Vente · Essai en concession | Qualified lead · Sale · Test drive |
| Garde-fous | Exclusions de marque · Mots-clés exclus | Brand exclusions · Negative keywords |

(Les points médians de ce tableau séparent les étiquettes ici ; ils ne s'affichent pas dans la page.)

Phrase de conclusion, posée à la fin de la séquence et toujours visible à l'état final :
FR « Google choisit où montrer l'annonce. Nous choisissons ce qu'il apprend. »
EN « Google chooses where the ad shows. We choose what it learns. »

Les six réseaux ne portent PAS de logo (ce sont des produits Google : on écrit leur nom, on ne
redessine pas leur marque). Une petite icône générique par réseau est permise si elle vient d'une
bibliothèque d'icônes (loupe, lecture, image, boussole, enveloppe, repère de carte).

## 4. Les formats que nous gérons

| | FR | EN |
|---|---|---|
| Titre (H2) | Les formats que nous gérons | The formats we run |
| Texte | Le bon format dépend de ce que cherche votre client, pas de ce que la plateforme pousse. | The right format depends on what your customer is looking for, not on what the platform pushes. |

Quatre formats. **Pas quatre cartes égales** : Performance Max et Search pèsent plus que les deux
autres, la mise en page doit le dire.

| Format | Texte FR | Texte EN | Étiquettes FR | Étiquettes EN |
|---|---|---|---|---|
| Search | Touchez les personnes qui cherchent déjà ce que vous vendez. Votre annonce apparaît en tête de Google au moment où la question est posée. | Reach people who are already searching for what you sell. Your ad appears at the top of Google at the moment the question is asked. | Ciblage par mots-clés, Extensions d'annonce, Enchères intelligentes, Annonces responsives | Keyword targeting, Ad extensions, Smart bidding, Responsive ads |
| Performance Max | Une seule campagne pour les six réseaux de Google, pilotée par les signaux et les conversions qu'on lui donne. | One campaign across Google's six networks, steered by the signals and conversions we give it. | Groupes d'éléments, Signaux d'audience, Conversions importées, Exclusions | Asset groups, Audience signals, Imported conversions, Exclusions |
| Shopping | Vos produits avec leur image et leur prix, directement dans les résultats. Le flux fait la moitié du travail, nous le tenons propre. | Your products with their image and price, right in the results. The feed does half the work, and we keep it clean. | Flux produits, Merchant Center, Inventaire local | Product feeds, Merchant Center, Local inventory |
| Display et vidéo / Display and video | Faire connaître la marque et retrouver les visiteurs qui n'ont pas converti, sur les sites partenaires et sur YouTube. | Build awareness and bring back visitors who did not convert, across partner sites and YouTube. | Remarketing, YouTube, Display responsive, Audiences personnalisées | Remarketing, YouTube, Responsive display, Custom audiences |

## 5. La méthode : de l'audit au reporting

Seconde animation de la page (un process, quatre états). **Aucune pastille numérotée 01 / 02 /
03 / 04** : l'ordre se lit par la position et par le mouvement.

| | FR | EN |
|---|---|---|
| Titre (H2) | De l'audit au reporting, en quatre temps | From audit to reporting, in four stages |

| Étape | Titre FR | Titre EN | Texte FR | Texte EN |
|---|---|---|---|---|
| 1 | Audit et découverte | Audit and discovery | Nous analysons vos campagnes actuelles et le paysage concurrentiel, et nous repérons les gains rapides. | We analyse your current campaigns and the competitive landscape, and we identify the quick wins. |
| 2 | Stratégie et mise en place | Strategy and setup | Structure des campagnes, rédaction des annonces, suivi des conversions et paramétrage des audiences. | Campaign structure, ad copy, conversion tracking and audience configuration. |
| 3 | Lancement et optimisation | Launch and optimisation | Suivi quotidien, tests A/B et ajustement des enchères, sur la base des performances réelles. | Daily monitoring, A/B testing and bid adjustments, based on real performance data. |
| 4 | Montée en charge et reporting | Scale and reporting | Nous augmentons ce qui fonctionne. Un rapport mensuel avec des indicateurs clairs et des recommandations. | We scale what works. A monthly report with clear KPIs and recommendations. |

## 6. La preuve

| | FR | EN |
|---|---|---|
| Titre (H2) | Leurs chiffres, pas les nôtres | Their numbers, not ours |
| Texte | Trois groupes de concessions, trois comptes Google Ads repris en main. | Three dealer groups, three Google Ads accounts turned around. |

Trois lignes (source : études de cas ; le lien mène à l'étude) :

| Client FR | Client EN | Chiffre FR | Chiffre EN | Libellé FR | Libellé EN | Second chiffre FR | Second chiffre EN | Logo |
|---|---|---|---|---|---|---|---|---|
| Groupe Théobald | Theobald Group | +112&nbsp;% | +112% | conversions Google Ads | Google Ads conversions | -50&nbsp;% de coût par conversion | -50% cost per conversion | `theobald.webp` |
| Groupe Vulcain | Vulcain Group | +145&nbsp;% | +145% | volume de leads | lead volume | -35&nbsp;% de coût par lead | -35% cost per lead | `vulcain.webp` |
| Groupe DMD | DMD Group | +225&nbsp;% | +225% | utilisateurs Google Ads | Google Ads users | +170&nbsp;% de conversions | +170% conversions | `dmd.webp` |

Lien de chaque ligne : FR « Lire l'étude de cas » / EN « Read the case study ».

Verbatim (trois lignes au plus à l'écran, guillemets typographiques) :

- FR : « Gérer le marketing digital de 31 concessions semblait impossible jusqu'à ce que MyDigipal
  nous montre comment bien le faire. Les gains d'efficacité ont été incroyables. »
  Directeur Marketing Digital, Groupe Théobald
- EN : “Managing 31 dealerships' digital marketing seemed impossible until MyDigipal showed us how
  to do it right. The efficiency gains have been incredible.”
  Digital Marketing Director, Theobald Group

## 7. Questions fréquentes

Titre (H2) : FR « Questions fréquentes » / EN « Frequently asked questions ».
Une question ouverte ne déplace pas l'écran. Le texte des réponses est dans le HTML (balises
`<details>` / `<summary>` ou équivalent accessible).

1. FR : Qu'est-ce que Google Ads et comment ça fonctionne&nbsp;?
   Google Ads est une plateforme publicitaire au coût par clic qui affiche vos annonces sur Google Search, YouTube et les sites partenaires. Vous ne payez que lorsque quelqu'un clique sur votre annonce. Le système fonctionne par enchères, où vous misez sur des mots-clés pertinents pour votre activité.
   EN : What is Google Ads and how does it work?
   Google Ads is a pay-per-click advertising platform that displays your ads on Google Search, YouTube and partner websites. You only pay when someone clicks on your ad. It works through an auction system where you bid on keywords relevant to your business.
2. FR : Quel budget prévoir pour Google Ads&nbsp;?
   Le budget dépend de votre secteur, de la concurrence et de vos objectifs. Nous recommandons de commencer par un budget de test pour collecter des données, puis d'augmenter selon les performances. L'essentiel est de regarder le retour sur investissement, pas seulement la dépense.
   EN : How much should I budget for Google Ads?
   Budget depends on your industry, competition and goals. We recommend starting with a test budget to gather data, then scaling based on performance. The key is to look at return on investment, not just spend.
3. FR : Combien de temps avant de voir des résultats&nbsp;?
   Contrairement au SEO, Google Ads peut générer du trafic dès que vos campagnes sont en ligne. L'optimisation, elle, prend du temps&nbsp;: une phase d'apprentissage pendant laquelle nous collectons des données, puis des améliorations continues.
   EN : How long until I see results?
   Unlike SEO, Google Ads can generate traffic as soon as your campaigns are live. Optimisation takes time: a learning phase during which we gather data, then continuous improvement.
4. FR : Quelle différence entre les campagnes Search et Display&nbsp;?
   Les campagnes Search affichent des annonces textuelles aux personnes qui cherchent vos mots-clés sur Google. Les campagnes Display affichent des annonces visuelles sur les sites partenaires pour développer la notoriété. Search capte l'intention, Display sert le remarketing et la notoriété.
   EN : What is the difference between Search and Display campaigns?
   Search campaigns show text ads to people searching for your keywords on Google. Display campaigns show visual ads across partner websites to build awareness. Search captures intent, Display serves remarketing and awareness.
5. FR : Comment suivez-vous les conversions&nbsp;?
   Nous installons Google Tag Manager et le suivi des conversions pour mesurer les leads, les ventes, les appels et les autres actions de valeur. Nous relions ces mesures à votre CRM pour voir ce que chaque campagne rapporte réellement.
   EN : How do you track conversions?
   We set up Google Tag Manager and conversion tracking to measure leads, sales, phone calls and other valuable actions. We connect these measurements to your CRM to see what each campaign really brings in.
6. FR : Gérez-vous la publicité YouTube&nbsp;?
   Oui. YouTube fait partie de l'écosystème Google Ads. Nous créons et gérons des campagnes vidéo, utiles pour la notoriété en B2B et pour le remarketing.
   EN : Do you manage YouTube advertising?
   Yes. YouTube is part of the Google Ads ecosystem. We create and manage video campaigns, useful for B2B awareness and for remarketing.

## 8. Appel final

| | FR | EN |
|---|---|---|
| Titre (H2) | Prêt à propulser votre activité digitale&nbsp;? | Ready to take your digital activity to the next level? |
| Texte | Calculez votre plan sur mesure en 3 minutes, ou écrivez-nous. Sans engagement, juste des résultats mesurés chaque semaine. | Calculate your tailored plan in 3 minutes, or get in touch. No commitment, just results measured weekly. |
| Bouton 1 | Calculer mon budget | Calculate my budget |
| Bouton 2 | Nous contacter | Contact us |

(« 3 minutes » est la promesse actuelle du site pour le calculateur, reprise telle quelle.)

## 9. Pied de page (celui du site)

Logo blanc, puis : FR « Le meilleur des deux intelligences » / EN « The best of both intelligences ».
FR « Agence de marketing digital basée à Londres, spécialisée en B2B, ABM et automobile. »
EN « Digital marketing agency based in London, specialised in B2B, ABM and automotive. »

| Colonne FR | Colonne EN | Liens FR | Liens EN |
|---|---|---|---|
| Services | Services | Google Ads, Paid Social, SEO, Emailing, B2B / ABM, Tracking et reporting | Google Ads, Paid Social, SEO, Emailing, B2B / ABM, Tracking & Reporting |
| IA | AI | AI Academy, AI Training, AI Solutions, AI Content | AI Academy, AI Training, AI Solutions, AI Content |
| Automobile | Automotive | Google Ads, Paid Social, Dynamic Ads | Google Ads, Paid Social, Dynamic Ads |
| Société | Company | Études de cas, Blog, Contact, Calculer mon budget, Recrutement | Case Studies, Blog, Contact, Calculate my budget, Careers |

Bas de page : « © 2026 MyDigipal LTD. » puis FR « Politique de confidentialité », « Conditions
d'utilisation » / EN « Privacy Policy », « Terms of Service ».

## Les deux appels flottants

« Calculer mon budget » (sous 640 px : « Mon budget ») et le visage de Paul
(`../../public/images/team/Team_Paul_Andre.webp`), côte à côte en bas à droite, classe
`.flottants` du socle. Le bouton du calculateur apparaît après 400 px de défilement. Le bandeau
cookies de démonstration (`socle/page.js`) occupe le bas de l'écran : les deux appels montent
au-dessus de lui. **Aucun élément flottant n'en recouvre un autre, à aucune largeur.**

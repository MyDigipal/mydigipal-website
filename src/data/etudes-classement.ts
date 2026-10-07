// Le classement des études de cas sur la page d'index (07/10/2026). Le visiteur choisit comment
// les parcourir : par problème, par groupe ou par secteur. Chaque étude doit figurer dans un
// problème et dans un groupe : `verifierClassement` arrête le build si une étude est oubliée,
// pour qu'une nouvelle fiche ne disparaisse pas de la page sans que personne ne le voie.

type Txt = { fr: string; en: string };

export const PROBLEMES: { id: string; titre: Txt; chapo: Txt; etudes: string[] }[] = [
  {
    id: 'acheteurs',
    titre: { fr: 'Faire venir des acheteurs', en: 'Bring in buyers' },
    chapo: {
      fr: 'Être là quand quelqu’un cherche une voiture, et lui faire laisser ses coordonnées.',
      en: 'Be there when someone is looking for a car, and get them to leave their details.',
    },
    etudes: [
      'google-ads-car-dealers', 'facebook-lead-ads', 'vehicle-catalogue-ads', 'open-days',
      'groupe-theobald', 'groupe-vulcain', 'groupe-lancien', 'autodif',
      'theobald-group', 'vulcain-group',
    ],
  },
  {
    id: 'contacts',
    titre: { fr: 'Ne laisser filer aucun contact', en: 'Never let a lead slip away' },
    chapo: {
      fr: 'Un appel décroché, un formulaire rappelé vite, et la vente au bout.',
      en: 'A call answered, a form called back fast, and the sale at the end.',
    },
    etudes: ['dealership-calls', 'lead-to-sale', 'dmd-group', 'guyane-automobile'],
  },
  {
    id: 'mesure',
    titre: { fr: 'Savoir ce qui marche', en: 'Know what works' },
    chapo: {
      fr: 'Compter juste, puis lire les chiffres par marque, par ville et par vendeur.',
      en: 'Count right, then read the numbers by brand, by city and by salesperson.',
    },
    etudes: ['dealership-tracking', 'dealer-dashboard', 'ggp-auto'],
  },
  {
    id: 'pipeline',
    titre: { fr: 'Remplir le pipeline en B2B', en: 'Fill the B2B pipeline' },
    chapo: {
      fr: 'Atteindre les bons comptes et obtenir des rendez-vous avec ceux qui décident.',
      en: 'Reach the right accounts and get meetings with the people who decide.',
    },
    etudes: ['quantum-metrics', 'genesys', 'gwi', 'symbl-ai'],
  },
];

// Un groupe = son étude principale d'abord (le portrait), puis ses autres études.
// `motCle` retrouve le groupe dans le champ `client` des dossiers (« Théobald, GGP Auto... »).
export const GROUPES: { id: string; nom: Txt; motCle?: string; etudes: string[] }[] = [
  { id: 'theobald', nom: { fr: 'Groupe Théobald', en: 'Théobald Group' }, motCle: 'Théobald', etudes: ['groupe-theobald', 'theobald-group'] },
  { id: 'ggp', nom: { fr: 'GGP Auto', en: 'GGP Auto' }, motCle: 'GGP', etudes: ['ggp-auto'] },
  { id: 'guyane', nom: { fr: 'Guyane Automobile', en: 'Guyane Automobile' }, motCle: 'Guyane', etudes: ['guyane-automobile'] },
  { id: 'dmd', nom: { fr: 'Groupe DMD', en: 'DMD Group' }, motCle: 'DMD', etudes: ['dmd-group', 'facebook-lead-ads'] },
  { id: 'vulcain', nom: { fr: 'Groupe Vulcain', en: 'Vulcain Group' }, motCle: 'Vulcain', etudes: ['groupe-vulcain', 'vulcain-group'] },
  { id: 'lancien', nom: { fr: 'Groupe Lancien', en: 'Lancien Group' }, motCle: 'Lancien', etudes: ['groupe-lancien'] },
  { id: 'autodif', nom: { fr: 'Autodif', en: 'Autodif' }, motCle: 'Autodif', etudes: ['autodif'] },
  { id: 'quantum', nom: { fr: 'Quantum Metrics', en: 'Quantum Metrics' }, etudes: ['quantum-metrics'] },
  { id: 'genesys', nom: { fr: 'Genesys', en: 'Genesys' }, etudes: ['genesys'] },
  { id: 'gwi', nom: { fr: 'GWI', en: 'GWI' }, etudes: ['gwi'] },
  { id: 'symbl', nom: { fr: 'Symbl.ai', en: 'Symbl.ai' }, etudes: ['symbl-ai'] },
];

// Les dossiers thématiques, qui ne sont l'étude d'aucun groupe en propre : ils apparaissent
// sous chaque groupe qu'ils citent (« On en parle aussi dans »).
export const DOSSIERS = [
  'google-ads-car-dealers', 'facebook-lead-ads', 'vehicle-catalogue-ads', 'open-days',
  'dealership-calls', 'lead-to-sale', 'dealership-tracking', 'dealer-dashboard',
];

export function verifierClassement(slugs: string[]) {
  const dansProblemes = PROBLEMES.flatMap((p) => p.etudes);
  const dansGroupes = new Set([...GROUPES.flatMap((g) => g.etudes), ...DOSSIERS]);
  const erreurs: string[] = [];
  for (const s of slugs) {
    const n = dansProblemes.filter((x) => x === s).length;
    if (n !== 1) erreurs.push(`${s} figure ${n} fois dans PROBLEMES (il faut 1)`);
    if (!dansGroupes.has(s)) erreurs.push(`${s} n'est rangé dans aucun groupe ni dans DOSSIERS`);
  }
  for (const s of [...dansProblemes, ...dansGroupes]) {
    if (!slugs.includes(s)) erreurs.push(`${s} est classé mais n'existe pas dans la collection`);
  }
  if (erreurs.length) {
    throw new Error(`Classement des études de cas (src/data/etudes-classement.ts) :\n- ${erreurs.join('\n- ')}`);
  }
}

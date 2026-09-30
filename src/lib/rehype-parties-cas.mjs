// Le récit d'une étude de cas faisait 6 000 px de blanc d'un seul tenant (groupe 4 de la
// refonte, 30/09/2026). Ce plugin, limité aux fichiers de `content/case-studies`, pose
// chaque partie ouverte par un titre de niveau 2 dans une `<section class="cas-partie">` :
// la page les met en bandes (la stratégie sur la brume, les résultats sur l'encre). Le texte
// ne change pas ; hors des études de cas, le plugin ne fait rien.
const texte = (n) => (n.type === 'text' ? n.value : (n.children || []).map(texte).join(''));

export default function rehypePartiesCas() {
  return (arbre, fichier) => {
    const chemin = String(fichier?.path ?? fichier?.history?.[0] ?? '');
    if (!/case-studies/.test(chemin)) return;
    const sortie = [];
    let partie = null;
    let rang = 0;
    for (const enfant of arbre.children) {
      if (enfant.type === 'element' && enfant.tagName === 'h2') {
        rang += 1;
        const titre = texte(enfant);
        const classes = ['cas-partie'];
        if (/r[ée]sultats|results/i.test(titre)) classes.push('cas-partie-encre');
        else if (rang === 2) classes.push('cas-partie-brume');
        partie = { type: 'element', tagName: 'section', properties: { className: classes }, children: [enfant] };
        sortie.push(partie);
      } else if (partie) {
        partie.children.push(enfant);
      } else {
        sortie.push(enfant);
      }
    }
    arbre.children = sortie;
  };
}

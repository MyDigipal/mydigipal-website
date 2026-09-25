// Les tableaux des articles débordaient de l'écran au téléphone (jusqu'à 265 px à
// 360 de large) et faisaient défiler toute la page de côté. Chaque tableau est
// posé dans une boîte qui défile seule (`.tableau-defile`, dans global.css).
export default function rehypeTableaux() {
  const parcourir = (noeud) => {
    if (!noeud.children) return;
    noeud.children = noeud.children.map((enfant) => {
      if (enfant.type === 'element' && enfant.tagName === 'table') {
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['tableau-defile'] },
          children: [enfant],
        };
      }
      parcourir(enfant);
      return enfant;
    });
  };
  return (arbre) => parcourir(arbre);
}

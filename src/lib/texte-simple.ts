/**
 * Les pages légales écrivent leur texte en markdown minimal (paragraphes, listes à
 * tirets, **gras**) dans des chaînes. Rendu brut, les astérisques et les tirets
 * s'affichaient tels quels (relevé le 25/09/2026). Ce rendu couvre exactement ce
 * qu'elles utilisent, rien de plus, et échappe le HTML avant tout.
 */
const echapper = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const enLigne = (s: string) => echapper(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export function texteSimple(source: string): string {
  const blocs: string[] = [];
  let paragraphe: string[] = [];
  let liste: string[] = [];
  const fermer = () => {
    if (paragraphe.length) blocs.push(`<p>${paragraphe.map(enLigne).join('<br>')}</p>`);
    if (liste.length) blocs.push(`<ul>${liste.map((l) => `<li>${enLigne(l)}</li>`).join('')}</ul>`);
    paragraphe = [];
    liste = [];
  };
  for (const brut of source.split('\n')) {
    const ligne = brut.trim();
    if (!ligne) { fermer(); continue; }
    const puce = ligne.match(/^[-*]\s+(.*)$/);
    if (puce) {
      if (paragraphe.length) { blocs.push(`<p>${paragraphe.map(enLigne).join('<br>')}</p>`); paragraphe = []; }
      liste.push(puce[1]);
    } else {
      if (liste.length) { blocs.push(`<ul>${liste.map((l) => `<li>${enLigne(l)}</li>`).join('')}</ul>`); liste = []; }
      paragraphe.push(ligne);
    }
  }
  fermer();
  return blocs.join('\n');
}

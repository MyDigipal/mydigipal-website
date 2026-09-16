// ============================================================
// Les écrans du produit filmés en français - UNE seule liste
// ============================================================
//
// ⚠️ IL Y EN AVAIT DEUX, et elles ont divergé le jour même de la première prise
// (16/09/2026). `academy/Demos.tsx` et `academy-v2/Video.tsx` déclaraient chacun
// leur `DEMOS_FR` : j'ai ajouté `prompts` dans celle de la V2, la page de vente
// a continué d'afficher l'écran anglais, et Paul l'a vu à l'écran. La page V2
// importe en effet `Visite` de l'ancien dossier, donc c'est l'ANCIENNE liste qui
// commandait l'affiche. Le journal du projet avertissait déjà : « deux listes
// auraient divergé au premier ajout ».
//
// Une boucle filmée dans la mauvaise langue se REFAIT, elle ne se traduit pas :
// elle montre l'interface de l'application, qui est bilingue.
//
// Ajouter un écran, c'est quatre fichiers dans `public/academy/demos/fr/`
// (`.webm`, `.mp4`, `.jpg` et la vignette `-v.jpg`, mêmes noms qu'en anglais) et
// une entrée ici. Rien n'oblige à tout refaire d'un coup.
//
// ⚠️ Une liste explicite, et pas une tentative de chargement : une balise
// `<source>` ne se replie PAS sur un 404, seulement sur un type que le
// navigateur ne sait pas lire. Un fichier français manquant donnerait donc un
// cadre noir, pas la version anglaise.

export const DEMOS_FR: ReadonlySet<string> = new Set<string>(['prompts']);

/** Le dossier d'un écran, dans la langue lue quand elle existe. */
export function baseDemo(nom: string, locale?: string): string {
  return locale === 'fr' && DEMOS_FR.has(nom) ? `/academy/demos/fr/${nom}` : `/academy/demos/${nom}`;
}

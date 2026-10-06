/**
 * Le texte des études de cas de la série automobile : des chaînes simples, avec deux marques
 * seulement, `**gras**` et `[lien](/adresse)`. Tout le reste est échappé : une fiche ne peut
 * pas injecter de HTML.
 */
const echapper = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function enrichir(s: string): string {
  return echapper(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((\/[^)\s]*|https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

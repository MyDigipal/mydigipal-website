// ============================================================
// Les livrables de la formation, partagés par les quatre pages outils
// ============================================================
//
// Ils viennent de la formaférence Claude donnée au Club d'affaires Protéine le
// 9 septembre 2026, construits autour d'une PME fictive, l'Atelier Rivière.
// `scripts/import-livrables-academy.py` les copie dans `public/academy/livrables/`
// en retirant le nom du client et en neutralisant la mention d'outil.
//
// ⚠️ Le document ne dit jamais avec quel outil il a été produit, et c'est ce qui
// permet de le montrer sur les quatre pages. La page, elle, ne prétend pas non
// plus : elle dit « produits pendant une session », ce qui est vrai. Écrire
// « produit avec Copilot » sur un document produit avec Claude serait faux, et
// se verrait : Copilot ne rend pas un artefact HTML.
//
// Les deux langues depuis le 13/09/2026. Les documents anglais sont produits par
// `scripts/livrables-textes.py`, qui ne touche QUE les nœuds de texte : la mise
// en page ne peut pas se perdre en chemin.

import type { Film, Livrable } from './types';

/**
 * Ce qui a réellement été produit pendant la formaférence du 9 septembre 2026,
 * autour d'une PME fictive, l'Atelier Rivière. Les fichiers sont importés par
 * `scripts/import-livrables-academy.py`, qui en retire le nom du client et
 * neutralise la mention d'outil : ces mêmes documents serviront sur les pages
 * Copilot, ChatGPT et Gemini, et écrire le nom d'un autre outil dessus serait
 * faux.
 *
 * Français seulement pour l'instant. Un anglophone à qui l'on ouvre une réponse
 * à appel d'offres en français s'arrête à la première ligne.
 */
export const LIVRABLES_FR: Livrable[] = [
  {
    fichier: '02-synthese',
    titre: 'Une note de préparation',
    texte:
      "Un rapport sectoriel de quarante-deux pages en entrée, une note de rendez-vous en sortie, avec la source de chaque chiffre.",
    cout: '42 pages lues, une note en cinq minutes',
  },
  {
    fichier: '03-presentation',
    titre: 'Un comité de direction',
    texte:
      'Des notes en vrac deviennent huit diapositives et trois décisions à prendre. Un chiffre inventé au passage, repéré à la relecture.',
    cout: 'des notes en vrac, huit diapositives',
  },
  {
    fichier: '04-dashboard',
    titre: 'Un tableau de bord mensuel',
    texte:
      "L'export comptable et l'export des devis, croisés en cinq chiffres qui tiennent sur un écran. Aucune saisie à la main.",
    cout: 'deux exports bruts, quinze minutes',
  },
  {
    fichier: '06-site',
    titre: 'Un site vitrine',
    texte:
      "Une page complète depuis une seule demande, puis ajustée en trois phrases. Ce que l'outil sait faire, et là où il s'arrête.",
    cout: 'une demande, trois retouches',
  },
  {
    fichier: '07-appel-offres',
    titre: "Une réponse à appel d'offres",
    texte:
      "Une recherche sur le donneur d'ordre, une autre dans vos propres dossiers, et un dossier de réponse. Avec une certification affirmée à tort, corrigée.",
    cout: 'deux recherches, un dossier complet',
  },
];


/** Les deux séquences filmées. Elles montrent des agents et des chaînes, donc
 *  la troisième étape du parcours. Paul, 13/09 : elles sont « très orientées
 *  Claude », elles ne sortent donc pas de sa page. */
export const FILMS_FR: Film[] = [
  {
    fichier: '08-agent',
    titre: 'Un agent qui qualifie à 22 h 47',
    texte:
      "Une demande arrive le soir. L'agent la lit, la qualifie, cherche le contexte, et le mail part à 22 h 49.",
    duree: '34 s',
  },
  {
    fichier: '09-automatisation',
    titre: 'Une prospection du lundi au mercredi',
    texte:
      'La chaîne part le lundi à huit heures, relance, et rend la réponse obtenue le mercredi.',
    duree: '38 s',
  },
];


/**
 * Les mêmes documents, en anglais.
 *
 * ⚠️ Le `fichier` porte son dossier (`en/…`) : c'est lui qui décide du chemin
 * servi et de la vignette. Un préfixe ajouté ailleurs finirait par diverger.
 */
export const LIVRABLES_EN: Livrable[] = [
  {
    fichier: 'en/02-synthese',
    titre: 'A meeting preparation note',
    texte:
      'A forty-two page sector report in, a one-page briefing note out, with the source of every figure.',
    cout: '42 pages read, a note in five minutes',
  },
  {
    fichier: 'en/03-presentation',
    titre: 'A board meeting',
    texte:
      'Scattered notes become eight slides and three decisions to take. One invented figure along the way, caught on review.',
    cout: 'scattered notes, eight slides',
  },
  {
    fichier: 'en/04-dashboard',
    titre: 'A monthly dashboard',
    texte:
      'The accounting export and the quotes export, cross-checked into five figures that fit on one screen. No manual entry.',
    cout: 'two raw exports, fifteen minutes',
  },
  {
    fichier: 'en/06-site',
    titre: 'A one-page website',
    texte:
      'A full page from a single request, then adjusted in three sentences. What the tool can do, and where it stops.',
    cout: 'one request, three corrections',
  },
  {
    fichier: 'en/07-appel-offres',
    titre: 'A tender response',
    texte:
      'Research on the buyer, more research in your own files, and a submission. Including a certification wrongly claimed, then corrected.',
    cout: 'two searches, a full submission',
  },
];

/** Les deux films, décrits en anglais. */
export const FILMS_EN: Film[] = [
  {
    fichier: '08-agent',
    titre: 'An agent qualifying a lead at 10.47 pm',
    texte:
      'A request arrives in the evening. The agent reads it, qualifies it, finds the context, and the email goes out at 10.49 pm.',
    duree: '34 s',
  },
  {
    fichier: '09-automatisation',
    titre: 'Outreach from Monday to Wednesday',
    texte: 'The chain starts on Monday at eight, follows up, and hands back the reply received on Wednesday.',
    duree: '38 s',
  },
];

/** Ce que chaque outil sait produire. Copilot ne fabrique pas de site, et
 *  montrer une page web sur sa page ferait mentir la démonstration. */
export function livrablesDe(
  outil: 'claude' | 'chatgpt' | 'gemini' | 'copilot',
  locale: 'fr' | 'en' = 'fr',
): Livrable[] {
  const tous = locale === 'en' ? LIVRABLES_EN : LIVRABLES_FR;
  if (outil === 'claude' || outil === 'chatgpt') return tous;
  return tous.filter((l) => !l.fichier.endsWith('06-site'));
}

/**
 * Le signal d'une réponse dans le panneau « Une question ? » (Paul, 18/09/2026 :
 * « rajoute une petite notification, un petit son que le site ferait au moment
 * où on répond »).
 *
 * Trois signaux, parce qu'aucun ne suffit seul : le son ne se joue pas sur un
 * téléphone en silencieux, la pastille ne se voit pas quand la page est en
 * arrière-plan, et le titre de l'onglet est le seul repère quand la personne
 * fait autre chose. Ils ne dépendent d'aucune autorisation du navigateur : les
 * notifications système, elles, en demandent une, et une demande d'autorisation
 * sur une page de vente fait fuir.
 *
 * ⚠️ Un navigateur refuse de jouer un son tant que la personne n'a rien cliqué
 * sur la page. Ici elle a ouvert le panneau et écrit, donc le contexte audio est
 * débloqué. En cas de refus, tout est enveloppé : le silence ne casse rien.
 */

let contexte: AudioContext | null = null;

/** Deux notes courtes et douces, le temps d'attirer l'œil sans faire sursauter. */
export function jouerDing(): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    contexte = contexte || new Ctor();
    if (contexte.state === 'suspended') void contexte.resume();
    const depart = contexte.currentTime;
    [
      { hz: 880, a: 0, d: 0.16 },
      { hz: 1174.7, a: 0.13, d: 0.22 },
    ].forEach(({ hz, a, d }) => {
      const osc = contexte!.createOscillator();
      const gain = contexte!.createGain();
      osc.type = 'sine';
      osc.frequency.value = hz;
      // Une attaque et une extinction douces : un créneau brut claque à l'oreille.
      gain.gain.setValueAtTime(0.0001, depart + a);
      gain.gain.exponentialRampToValueAtTime(0.06, depart + a + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, depart + a + d);
      osc.connect(gain).connect(contexte!.destination);
      osc.start(depart + a);
      osc.stop(depart + a + d + 0.02);
    });
  } catch {
    /* audio refusé ou indisponible : les deux autres signaux restent */
  }
}

let titreOrigine: string | null = null;
let rendreTitre: (() => void) | null = null;

/**
 * Le titre de l'onglet annonce les réponses non lues, et redevient lui-même dès
 * que la page repasse au premier plan.
 */
export function titreAlerte(nombre: number, libelle: string): void {
  if (typeof document === 'undefined') return;
  if (titreOrigine === null) titreOrigine = document.title;
  if (nombre <= 0) {
    rendreLeTitre();
    return;
  }
  document.title = `(${nombre}) ${libelle}`;
  if (!rendreTitre) {
    rendreTitre = () => {
      if (document.visibilityState === 'visible') rendreLeTitre();
    };
    document.addEventListener('visibilitychange', rendreTitre);
    window.addEventListener('focus', rendreTitre);
  }
}

export function rendreLeTitre(): void {
  if (typeof document === 'undefined' || titreOrigine === null) return;
  document.title = titreOrigine;
  if (rendreTitre) {
    document.removeEventListener('visibilitychange', rendreTitre);
    window.removeEventListener('focus', rendreTitre);
    rendreTitre = null;
  }
}

/** Le libellé du titre, dans la langue de la page. */
export function libelleAlerte(lang: 'fr' | 'en'): string {
  return lang === 'en' ? 'Paul has replied' : 'Paul a répondu';
}

/** Les deux signaux d'un coup, à l'arrivée de `nouvelles` réponses non lues. */
export function signalerReponse(nonLues: number, lang: 'fr' | 'en'): void {
  jouerDing();
  titreAlerte(nonLues, libelleAlerte(lang));
}

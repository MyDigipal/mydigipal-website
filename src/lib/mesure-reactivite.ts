/**
 * Relevé de la réactivité chez les vrais visiteurs (INP, Interaction to Next Paint).
 *
 * Pourquoi (05/11/2026) : la Search Console et CrUX donnent un INP de 212 ms sur tout le site
 * (seuil 200 ms), mais seulement au niveau du domaine, et le labo ne voit rien (80 ms de temps
 * bloqué sur la page Academy). Pour savoir QUELLE page, QUEL élément et QUEL script ralentissent
 * une interaction, on relève l'attribution de web-vitals et on la pousse dans le dataLayer.
 * GTM la relaie à GA4 (événement `web_vital_inp`), lisible dans l'export BigQuery
 * (`analytics_281550532`) sans déclarer de dimension.
 *
 * Seules les interactions de 100 ms et plus partent : les autres ne disent rien d'utile et
 * gonfleraient le volume d'événements. Une seule valeur par page vue (la pire, envoyée quand la
 * page est quittée ou cachée), comme le calcule Google.
 */
import { onINP } from 'web-vitals/attribution';

const SEUIL_MS = 100;

interface ScriptLoaf {
  duration: number;
  sourceURL?: string;
  sourceFunctionName?: string;
  invoker?: string;
}

const court = (texte: string | undefined, max = 100): string => (texte || '').slice(0, max);

// Une adresse de script réduite à ce qui l'identifie : le domaine pour un tiers, le nom du
// fichier pour les nôtres (les noms de `_astro/` portent un hachage qui change à chaque build).
const nomScript = (url: string | undefined): string => {
  if (!url) return '';
  try {
    const u = new URL(url, location.href);
    if (u.hostname !== location.hostname) return u.hostname;
    return u.pathname.split('/').pop() || u.pathname;
  } catch {
    return court(url, 60);
  }
};

export function relever(): void {
  onINP(
    (mesure) => {
      if (mesure.value < SEUIL_MS) return;
      const a = mesure.attribution;
      // Le script qui a le plus pesé pendant l'interaction (Long Animation Frames, Chrome).
      let script = '';
      let duree = 0;
      for (const trame of a.longAnimationFrameEntries || []) {
        // Le type livré par web-vitals ne déclare pas `scripts`, que Chrome fournit bien.
        const scripts = (trame as unknown as { scripts?: ScriptLoaf[] }).scripts || [];
        for (const s of scripts) {
          if (s.duration > duree) {
            duree = s.duration;
            script = `${nomScript(s.sourceURL)} ${s.sourceFunctionName || s.invoker || ''}`.trim();
          }
        }
      }
      const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: 'web_vital_inp',
        web_vital_value: Math.round(mesure.value),
        web_vital_rating: mesure.rating,
        inp_target: court(a.interactionTarget),
        inp_type: a.interactionType,
        inp_phases: `délai ${Math.round(a.inputDelay)} / traitement ${Math.round(a.processingDuration)} / rendu ${Math.round(a.presentationDelay)}`,
        inp_script: court(script ? `${script} (${Math.round(duree)} ms)` : ''),
        inp_load_state: a.loadState,
      });
    },
    { reportAllChanges: false },
  );
}


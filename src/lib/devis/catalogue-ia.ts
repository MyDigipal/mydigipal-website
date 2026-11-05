/**
 * Le catalogue du calculateur pour le conseiller IA (05/11/2026).
 *
 * Direction A choisie par Paul : le calculateur s'ouvre sur une conversation, l'IA choisit les
 * services et répond aux questions du calculateur à la place du visiteur, et le MOTEUR chiffre.
 * Ce catalogue dit à l'IA ce qu'elle peut choisir : chaque service, ses questions, leurs réponses
 * permises. **Aucun prix n'y figure** : un montant écrit par le modèle serait une invention, et
 * l'application Academy refuse toute réponse qui en contient un.
 *
 * Généré depuis `calculator-v6/engine.ts` (les mêmes questions que le parcours classique) et
 * servi sur `/calculateur-catalogue.json`, que l'application lit et garde dix minutes, comme
 * `/assistant-connaissance.json`. Un service ou une question ajoutés au calculateur sont donc
 * connus du conseiller au déploiement suivant, sans rien toucher dans l'application.
 *
 * Types de question :
 *   niveau    un indice d'option (« 0 », « 1 »...) ou « aucun » quand l'offre est facultative
 *   budget    un budget média mensuel en euros, ramené au palier le plus proche
 *   plusieurs des valeurs d'options séparées par des virgules
 *   choix     une valeur d'option
 *   nombre    un entier entre min et max
 */
import {
  BUDGET_STEPS,
  DOMAIN_ORDER,
  DURATION_CONFIG_MOIS,
  domainDesc,
  domainName,
  optionsFor,
  questionsFor,
  type Question,
  type Txt
} from '../../components/calculator-v6/engine';

export type TypeQuestionIa = 'niveau' | 'budget' | 'plusieurs' | 'choix' | 'nombre';

export interface OptionIa {
  valeur: string;
  libelle: Txt;
  detail?: Txt;
}

export interface QuestionIa {
  id: string;
  type: TypeQuestionIa;
  titre: Txt;
  aide?: Txt;
  options?: OptionIa[];
  min?: number;
  max?: number;
  /** « aucun » est permis (une offre que le visiteur peut ne pas prendre). */
  facultatif?: boolean;
}

export interface ServiceIa {
  id: string;
  nom: Txt;
  description: Txt;
  questions: QuestionIa[];
}

export interface CatalogueIa {
  genere: string;
  durees: number[];
  budgets: number[];
  services: ServiceIa[];
}

const txt = (fr: string, en: string): Txt => ({ fr, en });

/** Les offres qu'un visiteur peut laisser de côté : tout ce qui n'est pas le cœur du service. */
const FACULTATIFS = new Set([
  'social-creatives', 'social-feed-catalogue', 'seo-audit', 'seo-monthly', 'ai-chatbot', 'ai-workflow', 'ai-maintenance',
  'ai-content-blog', 'ai-content-social'
]);

function versQuestions(q: Question): QuestionIa[] {
  const base = { titre: q.title, ...(q.help ? { aide: q.help } : {}) };
  const options = () =>
    optionsFor(q, {}).map((o) => ({
      valeur: String(o.value),
      libelle: o.label,
      ...(o.desc && (o.desc.fr || o.desc.en) ? { detail: o.desc } : {})
    }));
  switch (q.kind) {
    case 'level':
      return [{ id: q.id, type: 'niveau', ...base, options: options(), ...(FACULTATIFS.has(q.id) ? { facultatif: true } : {}) }];
    case 'budget':
      return [{ id: q.id, type: 'budget', ...base, min: BUDGET_STEPS[0], max: BUDGET_STEPS[BUDGET_STEPS.length - 1] }];
    case 'channels':
    case 'multi':
      return [{ id: q.id, type: 'plusieurs', ...base, options: options() }];
    case 'choice':
      return [{ id: q.id, type: 'choix', ...base, options: options() }];
    case 'compteurs':
      // Un écran à compteurs devient une question par réglage.
      return (q.fields ?? []).map((f) =>
        f.kind === 'nombre'
          ? { id: f.id, type: 'nombre' as const, titre: f.label, min: f.min ?? 0, max: f.max ?? 100 }
          : { id: f.id, type: 'choix' as const, titre: f.label, options: (f.options ?? []).map((o) => ({ valeur: o.value, libelle: o.label })) }
      );
    default:
      // `volume` et `form` (contacts à acquérir, projet IA décrit) restent au parcours classique.
      return [];
  }
}

export function catalogueIa(genere = new Date().toISOString()): CatalogueIa {
  return {
    genere,
    durees: DURATION_CONFIG_MOIS,
    budgets: BUDGET_STEPS,
    services: DOMAIN_ORDER.map((d) => ({
      id: d,
      nom: txt(domainName(d, 'fr'), domainName(d, 'en')),
      description: txt(domainDesc(d, 'fr'), domainDesc(d, 'en')),
      questions: questionsFor(d).flatMap(versQuestions)
    }))
  };
}

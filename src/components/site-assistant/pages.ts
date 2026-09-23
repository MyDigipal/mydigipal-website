// La carte des pages du site, servie par `/assistant-pages.json` (générée à chaque build).
// L'assistant la lit une fois par visite, la garde dans sessionStorage, et sait alors ce que
// la personne a sous les yeux : quel service, quelle étude de cas, quel article.

export interface Fiche {
  /** service | case | blog | auto | home | contact | services | cases | blogs | ia */
  k: string;
  t: string;
  d?: string;
  /** L'identifiant du domaine du calculateur qui correspond à la page. */
  s?: string;
  /** automotive | b2b-tech */
  i?: string;
  /** Une page à proposer ensuite. */
  c?: string;
  /** Le résultat en une ligne (études de cas). */
  r?: string;
  /** Le client (études de cas). */
  cl?: string;
}

const CLE = 'mdp_pages_v1';
let carteEnCours: Promise<Record<string, Fiche>> | null = null;

export async function carte(): Promise<Record<string, Fiche>> {
  if (!carteEnCours) {
    carteEnCours = (async () => {
      try {
        const gardee = sessionStorage.getItem(CLE);
        if (gardee) return JSON.parse(gardee) as Record<string, Fiche>;
      } catch {
        /* stockage indisponible : on ira la chercher */
      }
      try {
        const r = await fetch('/assistant-pages.json');
        const j = r.ok ? ((await r.json()) as Record<string, Fiche>) : {};
        try {
          sessionStorage.setItem(CLE, JSON.stringify(j));
        } catch {
          /* trop gros ou stockage plein : tant pis, on la relira */
        }
        return j;
      } catch {
        return {};
      }
    })();
  }
  return carteEnCours;
}

const normaliser = (chemin: string) => chemin.replace(/\/+$/, '') || '/';

export async function ficheDe(chemin: string): Promise<Fiche | null> {
  const c = await carte();
  return c[normaliser(chemin)] ?? null;
}

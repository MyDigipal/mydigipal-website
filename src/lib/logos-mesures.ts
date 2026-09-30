/**
 * Les logos d'une page, prêts pour `BandeauLogos` à SURFACE égale (pages automobile,
 * 30/09/2026) : la version détourée de l'accueil quand elle existe (`LOGOS`), sinon le
 * fichier donné, dont la taille est lue au build dans `public/`. Un fichier illisible
 * garde la boîte de 28 px.
 */
import sharp from 'sharp';
import { LOGOS } from '@/components/accueil/donnees';

export interface LogoMesure {
  name: string;
  logo: string;
  largeur?: number;
  hauteur?: number;
  echelle?: number;
}

export async function mesurerLogos(
  logos: { name: string; logo: string }[],
  detoures: Record<string, string> = {},
  remplacements: Record<string, string> = {},
): Promise<LogoMesure[]> {
  return Promise.all(
    logos.map(async (l) => {
      const slug = detoures[l.name];
      const d = slug ? LOGOS[slug] : undefined;
      if (d) return { name: l.name, logo: d.src, largeur: d.largeur, hauteur: d.hauteur, echelle: d.echelle };
      const src = remplacements[l.name] ?? l.logo;
      try {
        const m = await sharp(`public${src}`).metadata();
        return { name: l.name, logo: src, largeur: m.width, hauteur: m.height };
      } catch {
        return { name: l.name, logo: src };
      }
    }),
  );
}

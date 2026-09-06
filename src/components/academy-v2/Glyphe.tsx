// ============================================================
// Pictogrammes de module, portés depuis l'application
// ============================================================
//
// Copie de `mydigipal-academy/src/components/ModuleGlyph.tsx`, restreinte aux
// vingt-trois modules que la page de vente montre. Même grammaire : grille de
// 24, trait de 1,6, un aplat de la teinte du module à 16 % qui lui donne une
// silhouette reconnaissable à petite taille.
//
// ⚠️ La teinte est posée en `color` sur le SVG, pas en `stroke` : le trait ET
// l'aplat s'y réfèrent par `currentColor`, et `fill` n'hérite pas de `stroke`.
//
// ⚠️ Aucun logo de plateforme n'est redessiné. Les quatre modules outils
// montrent ce que l'outil EST pour celui qui s'en sert (le tableur, la suite,
// le document long, la conversation) ; le nom de la marque reste dans le titre.

export type Glyphe =
  | 'door'
  | 'brain'
  | 'craft'
  | 'tool_office'
  | 'tool_suite'
  | 'tool_doc'
  | 'tool_chat'
  | 'layers'
  | 'scale'
  | 'shield'
  | 'pen'
  | 'image'
  | 'briefcase'
  | 'grid'
  | 'report'
  | 'radar'
  | 'podium'
  | 'team'
  | 'flag'
  | 'robot'
  | 'plug'
  | 'chain'
  | 'foundation';

const TRACES: Record<Glyphe, string> = {
  door: `<path d="M5.4 3.6h7.2v16.8H5.4z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M12.6 3.6H5.4v16.8h7.2"/> <path d="M12.6 2.8v18.4"/> <circle cx="10.4" cy="12" r=".9" fill="currentColor" stroke="none"/> <path d="M15.4 12h5.2m0 0-2.6-2.6m2.6 2.6-2.6 2.6"/>`,
  brain: `<path d="M11.2 4.4c-2.6 0-4.6 1.6-4.6 3.7 0 .5.1 1 .3 1.4-.9.6-1.5 1.5-1.5 2.6 0 1 .5 1.9 1.3 2.5-.1.3-.2.7-.2 1 0 1.9 1.8 3.4 4.1 3.4h.6z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M11.2 4.4c-2.6 0-4.6 1.6-4.6 3.7 0 .5.1 1 .3 1.4-.9.6-1.5 1.5-1.5 2.6 0 1 .5 1.9 1.3 2.5-.1.3-.2.7-.2 1 0 1.9 1.8 3.4 4.1 3.4h.6"/> <path d="M12.8 4.4c2.6 0 4.6 1.6 4.6 3.7 0 .5-.1 1-.3 1.4.9.6 1.5 1.5 1.5 2.6 0 1-.5 1.9-1.3 2.5.1.3.2.7.2 1 0 1.9-1.8 3.4-4.1 3.4h-.6"/> <path d="M12 4.4v15.2"/> <path d="M9.4 9.2c.9.5 1.6 1.4 1.6 2.6M14.6 13.4c-.9-.5-1.6-1.4-1.6-2.6"/>`,
  craft: `<rect x="4" y="4" width="16" height="4.4" rx="1.2" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="4" y="4" width="16" height="4.4" rx="1.2"/> <rect x="4" y="9.8" width="16" height="4.4" rx="1.2"/> <rect x="4" y="15.6" width="11" height="4.4" rx="1.2"/> <path d="M7.2 6.2h1.6M7.2 12h1.6M7.2 17.8h1.6"/>`,
  tool_office: `<rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2"/> <path d="M3.4 9.2h17.2M9.4 9.2v10.4"/> <path d="m13 13 4.4 1.6-1.8.8-.8 1.8z" fill="currentColor" stroke="none"/>`,
  tool_suite: `<rect x="2.6" y="6.4" width="13.4" height="9.6" rx="1.8" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="2.6" y="6.4" width="13.4" height="9.6" rx="1.8"/> <path d="m2.6 7.6 6.7 4.4 6.7-4.4"/> <path d="M13.6 11.6h5.8a1.6 1.6 0 0 1 1.6 1.6v6.6a1.6 1.6 0 0 1-1.6 1.6h-5.4"/> <path d="M15.8 15.4h3.2M15.8 18h2"/>`,
  tool_doc: `<path d="M5 3.6h9.4L19 8.2v12.2H5z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M5 3.6h9.4L19 8.2v12.2H5z"/> <path d="M14.2 3.8v4.4H18.8"/> <path d="M7.6 12.4h8.8M7.6 15.4h8.8M7.6 18h5.4"/>`,
  tool_chat: `<path d="M3.4 5.6h12.2v8.2H8.2l-4.8 3.6z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M3.4 5.6h12.2v8.2H8.2l-4.8 3.6z"/> <path d="M18 9.4h2.6v8.2h-3.4l-3.6 2.8v-2.8h-1.4"/> <path d="M6.4 9.8h6.2"/>`,
  layers: `<path d="m12 3.4 8.4 4.3-8.4 4.3-8.4-4.3z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="m12 3.4 8.4 4.3-8.4 4.3-8.4-4.3z"/> <path d="m4.6 12 7.4 3.8 7.4-3.8"/> <path d="m4.6 16.3 7.4 3.8 7.4-3.8"/>`,
  scale: `<path d="M12 5.4v13.2M7 18.6h10" stroke-width="1.6"/> <path d="m4 11 2.8-5.2L9.6 11z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="m4 11 2.8-5.2L9.6 11a2.8 2.8 0 0 1-5.6 0Z"/> <path d="m14.4 11 2.8-5.2L20 11z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="m14.4 11 2.8-5.2L20 11a2.8 2.8 0 0 1-5.6 0Z"/> <path d="M6.8 5.8h10.4"/>`,
  shield: `<path d="M12 3.4l7 2.6v5.4c0 4-2.9 7.4-7 8.8-4.1-1.4-7-4.8-7-8.8V6z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M12 3.4l7 2.6v5.4c0 4-2.9 7.4-7 8.8-4.1-1.4-7-4.8-7-8.8V6z"/> <path d="m8.8 11.8 2.2 2.2 4.2-4.4"/>`,
  pen: `<path d="M4 20l1.4-4.4L16.2 4.8a2 2 0 0 1 2.8 2.8L8.4 18.6z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M4 20l1.4-4.4L16.2 4.8a2 2 0 0 1 2.8 2.8L8.4 18.6z"/> <path d="m14.6 6.4 3 3"/> <path d="M4 20h6"/>`,
  image: `<rect x="3.4" y="4.8" width="17.2" height="14.4" rx="2" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="3.4" y="4.8" width="17.2" height="14.4" rx="2"/> <circle cx="8.4" cy="9.6" r="1.5"/> <path d="m3.8 16.6 4.6-4.2 3.4 3 3-2.6 5.4 4.6"/>`,
  briefcase: `<rect x="3.2" y="7.6" width="17.6" height="11.6" rx="2" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="3.2" y="7.6" width="17.6" height="11.6" rx="2"/> <path d="M9 7.6V6a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 6v1.6"/> <path d="M3.2 12.6h17.6"/> <path d="M10.6 12.6h2.8"/>`,
  grid: `<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.4" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.4"/> <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.4"/> <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.4"/> <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.4"/> <path d="M6.4 7.2h1.6M16 7.2h1.6M6.4 16.8h1.6M16 16.8h1.6"/>`,
  report: `<rect x="4.4" y="3.6" width="15.2" height="16.8" rx="2" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="4.4" y="3.6" width="15.2" height="16.8" rx="2"/> <path d="M8 8.2h8M8 12h8M8 15.8h4.6"/>`,
  radar: `<circle cx="12" cy="12" r="8.4" fill="currentColor" fill-opacity=".16" stroke="none"/> <circle cx="12" cy="12" r="8.4"/> <circle cx="12" cy="12" r="4.6"/> <path d="M12 12 18 6.6"/> <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/> <circle cx="16.6" cy="8.4" r="1.4" fill="currentColor" stroke="none"/>`,
  podium: `<path d="M8.4 20v-6.4h7.2V20z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M8.4 20v-6.4h7.2V20z"/> <path d="M3 20h18"/> <circle cx="12" cy="6.4" r="2.6"/> <path d="M9.6 13.6c0-2 1.1-3.2 2.4-3.2s2.4 1.2 2.4 3.2"/> <path d="M5.6 20v-3.4h2.8M18.4 20v-3.4h-2.8"/>`,
  team: `<circle cx="8.4" cy="7.6" r="3.2" fill="currentColor" fill-opacity=".16" stroke="none"/> <circle cx="8.4" cy="7.6" r="3.2"/> <path d="M2.8 19.4c0-3.2 2.4-5.4 5.6-5.4s5.6 2.2 5.6 5.4"/> <circle cx="17" cy="10" r="2.6"/> <path d="M15.4 15c2.8 0 5.2 1.9 5.2 4.4"/>`,
  flag: `<path d="M6 4.6h11.8l-2.6 3.6 2.6 3.6H6z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M6 4.6h11.8l-2.6 3.6 2.6 3.6H6"/> <path d="M6 3.4v17.2"/>`,
  robot: `<rect x="4.2" y="8.2" width="15.6" height="10.6" rx="3" fill="currentColor" fill-opacity=".16" stroke="none"/> <rect x="4.2" y="8.2" width="15.6" height="10.6" rx="3"/> <path d="M12 3.6v4.6"/> <circle cx="12" cy="3.2" r="1.1"/> <circle cx="9" cy="12.6" r="1.2" fill="currentColor" stroke="none"/> <circle cx="15" cy="12.6" r="1.2" fill="currentColor" stroke="none"/> <path d="M9.6 16h4.8"/> <path d="M2.6 12v3M21.4 12v3"/>`,
  plug: `<path d="M6.4 8.6h11.2v2.8a5.6 5.6 0 1 1-11.2 0z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M6.4 8.6h11.2v2.8a5.6 5.6 0 1 1-11.2 0z"/> <path d="M9.2 3.4v5.2M14.8 3.4v5.2"/> <path d="M12 17v3.6"/>`,
  chain: `<rect x="2.4" y="8.2" width="10.4" height="7.6" rx="3.8" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M10 8.2H6.2a3.8 3.8 0 0 0 0 7.6H10"/> <path d="M14 8.2h3.8a3.8 3.8 0 0 1 0 7.6H14"/> <path d="M8.6 12h6.8" stroke-width="2"/>`,
  foundation: `<path d="M4.4 20v-4h15.2v4z" fill="currentColor" fill-opacity=".16" stroke="none"/> <path d="M3 20.4h18"/> <path d="M4.4 20v-4h15.2v4"/> <path d="M6.8 16v-3.6h10.4V16"/> <path d="M9.4 12.4V8.8h5.2v3.6"/> <path d="M12 8.8V5.2"/>`,
};

export default function Glyphe({
  nom,
  taille = 20,
  couleur,
}: {
  nom: Glyphe;
  taille?: number;
  couleur?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={couleur ? { color: couleur } : undefined}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: TRACES[nom] }}
    />
  );
}

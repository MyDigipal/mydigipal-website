#!/usr/bin/env python3
"""Fabrique `src/components/sections/logos-outils.ts` depuis les SVG de simple-icons.

Les outils de la passerelle MCP (`MarketingStackGrid.astro`) montrés avec leur vraie
marque, en couleur (règle de Paul du 30/09/2026 : les logos en couleur partout). Les
SVG viennent de simple-icons (CC0), version 16.33.0, gardés tels quels dans
`scripts/sources-marques/outils/` ; la couleur est celle que simple-icons donne pour
la marque. Générer plutôt que recopier : un tracé recopié de travers ne se voit pas à
la relecture.

Absents de simple-icons, donc sans logo sur la page (le nom seul, jamais une fausse
marque) : LinkedIn (retiré de simple-icons à la demande de la marque), Ahrefs,
Lemlist, Airscale, Salesforce, Marketo, Pipedrive, Cookiebot, OneTrust, Axeptio,
Didomi.

Relancer après tout changement de source : python3 scripts/logos-outils-mcp.py
"""

import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
ICI = RACINE / "scripts" / "sources-marques" / "outils"
SORTIE = RACINE / "src" / "components" / "sections" / "logos-outils.ts"

# nom affiché sur la page -> (fichier simple-icons, couleur de la marque selon simple-icons)
OUTILS = {
    "Google Ads": ("googleads", "#4285F4"),
    "Meta Ads": ("meta", "#0467DF"),
    "Google Analytics 4": ("googleanalytics", "#E37400"),
    "Search Console": ("googlesearchconsole", "#458CF5"),
    "BigQuery": ("googlebigquery", "#669DF6"),
    "Tag Manager": ("googletagmanager", "#246FDB"),
    "ClickUp": ("clickup", "#7B68EE"),
    "Notion": ("notion", "#000000"),
    "Gmail": ("gmail", "#EA4335"),
    "Google Drive": ("googledrive", "#4285F4"),
    "Sheets": ("googlesheets", "#34A853"),
    "Docs": ("googledocs", "#4285F4"),
    "Slides": ("googleslides", "#FBBC04"),
    "Calendar": ("googlecalendar", "#4285F4"),
    "n8n": ("n8n", "#EA4B71"),
    "Render": ("render", "#000000"),
    # Les plateformes et outils des pages de services (groupe 2, 30/09/2026).
    "YouTube": ("youtube", "#FF0000"),
    "X": ("x", "#000000"),
    "TikTok": ("tiktok", "#000000"),
    "WordPress": ("wordpress", "#21759B"),
    "Shopify": ("shopify", "#7AB55C"),
    "Wix": ("wix", "#0C6EFC"),
    "PrestaShop": ("prestashop", "#DF0067"),
    "Webflow": ("webflow", "#146EF5"),
    "HubSpot": ("hubspot", "#FF7A59"),
    "Zoho": ("zoho", "#E42527"),
    "Instagram": ("instagram", "#FF0069"),
    "Facebook": ("facebook", "#0866FF"),
    "Mailchimp": ("mailchimp", "#FFE01B"),
    "Brevo": ("brevo", "#0B996E"),
    "Looker": ("looker", "#4285F4"),
}

ENTETE = '''/**
 * Les marques des outils de la passerelle MCP, un tracé chacune, en couleur.
 *
 * Fichier GÉNÉRÉ par `scripts/logos-outils-mcp.py` depuis les SVG de simple-icons (CC0)
 * gardés dans `scripts/sources-marques/outils/`. Ne pas retoucher les tracés à la main.
 *
 * ⚠️ Usage nominatif : ces marques disent à quels outils la passerelle se branche, rien
 * d'autre. Jamais à côté du logo MyDigipal d'une manière qui suggérerait un partenariat.
 */

export interface LogoOutil {
  viewBox: string;
  trace: string;
  couleur: string;
}

'''


def main() -> None:
    sortie = {}
    for nom, (fichier, couleur) in OUTILS.items():
        svg = (ICI / f"{fichier}.svg").read_text(encoding="utf-8")
        vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
        traces = re.findall(r'<path[^>]*\sd="([^"]+)"', svg)
        if len(traces) != 1:
            raise SystemExit(f"{fichier}.svg : un seul tracé attendu, {len(traces)} trouvés")
        sortie[nom] = {"viewBox": vb, "trace": traces[0], "couleur": couleur}
    corps = "export const LOGOS_OUTILS: Record<string, LogoOutil> = " + json.dumps(sortie, ensure_ascii=False, indent=2) + ";\n"
    SORTIE.write_text(ENTETE + corps, encoding="utf-8")
    print(f"{len(sortie)} logos écrits dans {SORTIE.relative_to(RACINE)}")


if __name__ == "__main__":
    main()

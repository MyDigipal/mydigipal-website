#!/usr/bin/env python3
"""Fabrique `src/components/academy-tools/logos.ts` depuis les SVG téléchargés.

Les quatre marques sont des tracés uniques, monochromes, donc elles se rendent
en `currentColor` et prennent la couleur du texte qui les entoure. Générer le
fichier plutôt que recopier les tracés à la main : un `d` de 1 800 caractères
recopié de travers ne se voit pas à la relecture.
"""

import io
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
ICI = RACINE / "scripts" / "sources-marques"
SORTIE = RACINE / "src" / "components" / "academy-tools" / "logos.ts"

# outil -> (fichier, source, ce qu'on en dit)
SOURCES = {
    "claude": ("logos/claude.svg", "simple-icons (CC0), marque d'Anthropic"),
    "copilot": (
        "logos/copilot-1c.svg",
        "Wikimedia Commons, « Microsoft 365 Copilot Icon one-color », marque de Microsoft",
    ),
    "chatgpt": ("logos/openai.svg", "simple-icons (CC0), marque d'OpenAI"),
    "gemini": ("logos/googlegemini.svg", "simple-icons (CC0), marque de Google"),
}

ENTETE = '''/**
 * Les marques des quatre outils, en un seul tracé chacune.
 *
 * Pourquoi ici et pas dans `public/` : ce sont quatre tracés de quelques
 * centaines d'octets, affichés dans un îlot React. Quatre fichiers à aller
 * chercher sur le réseau pour ça coûterait plus cher que le rendu, et un
 * `<img>` ne prend pas la couleur du texte qui l'entoure.
 *
 * ⚠️ Elles sont MONOCHROMES et se rendent en `currentColor`, volontairement.
 * Les vraies marques de Copilot et de Gemini portent un dégradé, et le système
 * de l'Academy n'a qu'une couleur d'accent, l'or, sans aucun dégradé : quatre
 * dégradés de marques différentes dans la même rangée de cartes se battraient
 * entre eux et avec la page.
 *
 * ⚠️ Usage nominatif : ces marques identifient les outils que la formation
 * enseigne, rien d'autre. Ne jamais les poser à côté du logo MyDigipal d'une
 * manière qui suggèrerait un partenariat ou une certification.
 *
 * Fichier GÉNÉRÉ par `scripts/marques-outils.py`, depuis les SVG d'origine
 * gardés dans `scripts/sources-marques/logos/`. Ne pas retoucher les tracés à
 * la main.
 */

export interface MarqueOutil {
  viewBox: string;
  /** Le tracé, en `currentColor`. */
  trace: string;
  /** D'où vient le fichier, pour qu'on puisse y revenir. */
  source: string;
}

export const MARQUES: Record<string, MarqueOutil> = {
'''


def main() -> None:
    morceaux = [ENTETE]
    for outil, (fichier, source) in SOURCES.items():
        svg = io.open(ICI / fichier, encoding="utf-8").read()
        viewbox = re.search(r'viewBox="([^"]+)"', svg).group(1)
        traces = re.findall(r'\sd="([^"]+)"', svg)
        if len(traces) != 1:
            raise SystemExit(f"{outil} : {len(traces)} tracés, un seul attendu")
        trace = traces[0].strip()
        if "'" in trace or "\\" in trace:
            raise SystemExit(f"{outil} : le tracé contient un caractère à échapper")
        morceaux.append(
            f"  {outil}: {{\n"
            f"    viewBox: '{viewbox}',\n"
            f"    trace:\n      '{trace}',\n"
            f"    source: {json.dumps(source, ensure_ascii=False)},\n"
            f"  }},\n"
        )
    morceaux.append("};\n")
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    io.open(SORTIE, "w", encoding="utf-8", newline="\n").write("".join(morceaux))
    print(f"écrit : {SORTIE} ({SORTIE.stat().st_size} octets)")


if __name__ == "__main__":
    main()

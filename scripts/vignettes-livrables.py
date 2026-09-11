#!/usr/bin/env python3
"""Capture une vignette par livrable, pour les cartes des pages outils.

Une vignette est le HAUT du document, pas la page entière : ce qu'on montre sur
une carte de 320 px doit rester lisible, et un document de trois écrans réduit à
la taille d'une carte ne montre plus rien.

Prérequis : les fichiers sont dans public/academy/livrables/ (les y mettre avec
scripts/import-livrables-academy.py). Sortie : le même dossier, sous vignettes/.

    python scripts/vignettes-livrables.py
"""

from pathlib import Path
from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = RACINE / "public" / "academy" / "livrables"
SORTIE = DOSSIER / "vignettes"
DOCS = ["02-synthese", "03-presentation", "04-dashboard", "06-site", "07-appel-offres"]


def main() -> None:
    SORTIE.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        nav = p.chromium.launch()
        # Une carte fait 380 px de large au plus : 960 px de capture suffisent, et
        # une vignette de 300 Ko sur une page qui en pèse 78 serait absurde.
        page = nav.new_page(viewport={"width": 960, "height": 620}, device_scale_factor=1)
        for nom in DOCS:
            page.goto((DOSSIER / f"{nom}.html").as_uri())
            page.wait_for_timeout(700)
            cible = SORTIE / f"{nom}.jpg"
            page.screenshot(path=str(cible), type="jpeg", quality=70)
            print(f"  {nom:20} {cible.stat().st_size // 1024:4} Ko")
        nav.close()


if __name__ == "__main__":
    main()

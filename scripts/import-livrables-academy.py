#!/usr/bin/env python3
"""Importe les livrables de la formation Claude vers les pages outils de l'Academy.

Les documents et les vidéos viennent de la formaférence donnée au Club d'affaires
Protéine le 9 septembre 2026. Ils ont été construits autour d'une PME fictive,
l'Atelier Rivière (agencement sur mesure à Toulouse), ce qui les rend publiables
tels quels : aucune donnée réelle, aucun client identifiable.

Trois transformations, et elles ont chacune une raison :

1. `noindex` sur chaque document. Ce sont des pièces jointes à une page de vente,
   pas des pages du site. Sans cette balise, `scripts/check-seo.mjs` les traite
   comme des pages indexables et fait échouer le build sur leur titre et leur
   description, qui ne suivent pas les normes du site.

2. La mention du Club d'affaires Protéine disparaît. Le club a commandé une
   formation, il n'a pas donné son nom à une page de vente publique.

3. « Produit par Claude » devient une mention neutre. Ces mêmes documents
   serviront sur les pages Copilot, ChatGPT et Gemini : y afficher le nom d'un
   autre outil serait faux, et afficher « produit par Copilot » sur un document
   produit par Claude le serait encore plus. La page dit avec quel outil on
   travaille ; le document dit seulement qu'il a été produit avec l'IA, et en
   combien de temps.

Relancer après toute modification des sources :
    python scripts/import-livrables-academy.py
"""

import io
import re
import shutil
from pathlib import Path

SOURCE = Path(
    r"C:\Users\paula\AppData\Roaming\Claude\.claude\projects\Client Projects"
    r"\Club Protéine\Formaference Claude\_claude_demos"
)
DEST = Path(__file__).resolve().parent.parent / "public" / "academy" / "livrables"

DOCUMENTS = [
    "02-synthese.html",
    "03-presentation.html",
    "04-dashboard.html",
    "06-site.html",
    "07-appel-offres.html",
]
# `05-video.mp4`, le film de présentation produit sans logiciel de montage, n'est
# pas importé : il n'a pas sa place dans la bande « ce qui tourne sans personne »,
# qui parle d'agents et de chaînes. L'ajouter ici le remettrait dans le dépôt.
VIDEOS = ["08-agent.mp4", "09-automatisation.mp4"]

NOINDEX = '<meta name="robots" content="noindex, nofollow">'

REMPLACEMENTS = [
    # Le nom du client sort, sous toutes ses formes.
    (r"\s*&middot;\s*Démonstration MyDigipal pour le Club d'affaires Protéine", ""),
    (r"Démonstration MyDigipal pour le Club d'affaires Protéine", "Démonstration MyDigipal"),
    (r"Club d'affaires Protéine", "MyDigipal"),
    # La mention d'outil devient neutre : ces documents servent sur quatre pages.
    # Toutes les formes y passent, y compris les mentions narratives (« Claude a
    # laissé passer un chiffre ») : sur la page Copilot, lire le nom d'un autre
    # outil dans le récit de l'erreur ne veut rien dire.
    (r"(?:par|avec) <b>Claude</b>", "avec l'IA"),
    (
        r"(Produit|Construit|Rédigé|produite) (?:par|avec) Claude",
        lambda m: f"{m.group(1)} avec l'IA",
    ),
    # En tête de phrase la majuscule suit, ailleurs la minuscule.
    (r"(?<=[.!?] )Claude" + chr(92) + "b", "L'assistant"),
    (chr(92) + "bClaude" + chr(92) + "b", "l'assistant"),
]


def transformer(html: str) -> str:
    for motif, par in REMPLACEMENTS:
        html = re.sub(motif, par, html)
    if "noindex" not in html:
        html = re.sub(r"(<head[^>]*>)", r"\1\n  " + NOINDEX, html, count=1)
    return html


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for nom in DOCUMENTS:
        src = SOURCE / nom
        if not src.exists():
            raise SystemExit(f"introuvable : {src}")
        html = io.open(src, encoding="utf-8").read()
        io.open(DEST / nom, "w", encoding="utf-8", newline="\n").write(transformer(html))
        print(f"  {nom:24} {(DEST / nom).stat().st_size // 1024:4} Ko")
    for nom in VIDEOS:
        src = SOURCE / nom
        if not src.exists():
            raise SystemExit(f"introuvable : {src}")
        shutil.copy2(src, DEST / nom)
        print(f"  {nom:24} {(DEST / nom).stat().st_size // 1024:4} Ko")
    print(f"\n{len(DOCUMENTS) + len(VIDEOS)} fichiers dans {DEST}")


if __name__ == "__main__":
    main()

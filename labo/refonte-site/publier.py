#!/usr/bin/env python3
"""Prépare les maquettes pour une publication hors du dépôt (page privée, serveur statique).

Les maquettes lisent leurs images et leurs polices dans `../../public/`, ce qui ne marche
qu'à l'intérieur du dépôt. Ce script en fait une copie autonome :

  - chaque fichier référencé sous `../../public/` est copié dans `medias/`, sous un nom sans
    espace ni accent, et toutes les références sont réécrites ;
  - la langue et le mode figé se lisent aussi dans le stockage du navigateur, parce qu'une
    page publiée ne reçoit pas toujours les paramètres de son adresse ;
  - la galerie (`galerie.html`) devient la page d'entrée.

Usage :  python labo/refonte-site/publier.py <dossier de sortie>
Le script écrit aussi `fichiers.json`, la liste « chemin publié -> fichier local ».
"""

import io
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path
from urllib.parse import unquote

ICI = Path(__file__).parent
DEPOT = ICI.parent.parent
PUBLIC = DEPOT / "public"

PAGES = ["direction-a", "direction-b", "direction-c"]
SOCLE = ["socle/socle.css", "socle/motion.js", "socle/page.js"]

REFERENCE = re.compile(r"""(?:\.\./)+public/([^"'()<>\s?#]+(?:\s[^"'()<>?#]+?)*?\.(?:png|jpe?g|webp|avif|svg|gif|woff2?|mp4|webm))""", re.I)

FIGE_PAGE = "/[?&]fige=1/.test(location.search)"
FIGE_PAGE_2 = "(/[?&]fige=1/.test(location.search) || (function () { try { return localStorage.getItem('mdp-maquette-fige') === '1'; } catch (e) { return false; } })())"
FIGE_MOTEUR = "var fige = /[?&]fige=1/.test(window.location ? window.location.search : '');"
FIGE_MOTEUR_2 = (
    "var fige = /[?&]fige=1/.test(window.location ? window.location.search : '') ||\n"
    "    (function () { try { return window.localStorage.getItem('mdp-maquette-fige') === '1'; } catch (e) { return false; } })();"
)


def lire(p: Path) -> str:
    return io.open(p, encoding="utf-8").read()


def ecrire(p: Path, s: str) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)


def nom_propre(chemin: str) -> str:
    """`images/Logos/MyDigipal Logo_Full Main.png` -> `medias/images-logos-mydigipal-logo-full-main.png`."""
    brut = unicodedata.normalize("NFKD", chemin).encode("ascii", "ignore").decode("ascii")
    base, _, ext = brut.rpartition(".")
    base = re.sub(r"[^A-Za-z0-9]+", "-", base).strip("-").lower()
    return f"medias/{base}.{ext.lower()}"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage : python publier.py <dossier de sortie>")
    sortie = Path(sys.argv[1])
    if sortie.exists():
        shutil.rmtree(sortie)
    sortie.mkdir(parents=True)

    medias = {}       # chemin dans public/ -> chemin publié
    manquants = []
    fichiers = {}     # chemin publié -> fichier local

    def reecrire(texte: str, profondeur: int) -> str:
        """Remplace chaque référence à ../../public/... par son chemin publié."""
        prefixe = "../" * profondeur

        def remplace(m):
            relatif = unquote(m.group(1))
            source = PUBLIC / relatif
            if not source.is_file():
                manquants.append(relatif)
                return m.group(0)
            if relatif not in medias:
                medias[relatif] = nom_propre(relatif)
            return prefixe + medias[relatif]

        return REFERENCE.sub(remplace, texte)

    sources = []
    for page in PAGES:
        for ext in ("html", "css", "js"):
            f = ICI / f"{page}.{ext}"
            if f.is_file():
                sources.append((f"{page}.{ext}", f, 0))
    for s in SOCLE:
        sources.append((s, ICI / s, 1))
    galerie = ICI / "galerie.html"
    if galerie.is_file():
        sources.append(("galerie.html", galerie, 0))

    for publie, source, profondeur in sources:
        texte = reecrire(lire(source), profondeur)
        if publie.endswith(".html"):
            texte = texte.replace(FIGE_PAGE, FIGE_PAGE_2)
        if publie == "socle/motion.js":
            assert FIGE_MOTEUR in texte, "le moteur a changé : revoir FIGE_MOTEUR"
            texte = texte.replace(FIGE_MOTEUR, FIGE_MOTEUR_2)
        ecrire(sortie / publie, texte)
        fichiers[publie] = str(sortie / publie)

    for relatif, publie in sorted(medias.items()):
        cible = sortie / publie
        cible.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(PUBLIC / relatif, cible)
        fichiers[publie] = str(cible)

    ecrire(sortie / "fichiers.json", json.dumps(fichiers, ensure_ascii=False, indent=1))

    poids = sum(Path(v).stat().st_size for v in fichiers.values())
    print("pages et scripts :", len(sources))
    print("medias copies    :", len(medias))
    print("poids total      :", round(poids / 1024), "Ko")
    if manquants:
        print("MANQUANTS :")
        for m in sorted(set(manquants)):
            print("   ", m)
    restes = []
    for publie, _, _ in sources:
        t = lire(sortie / publie)
        if "public/" in t:
            restes.append(publie)
    if restes:
        print("REFERENCES NON REECRITES dans :", ", ".join(restes))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Extrait ou réinjecte les textes d'un livrable, pour la version anglaise.

Les cinq documents de `public/academy/livrables/` sont des pages autonomes, avec
leur style. Les traduire en réécrivant le HTML ferait perdre la mise en page à la
première inattention ; on ne touche donc QUE les nœuds de texte.

    python scripts/livrables-textes.py extraire 04-dashboard
        -> écrit <scratch>/04-dashboard.textes.json, une entrée par nœud

    python scripts/livrables-textes.py injecter 04-dashboard <traduction.json>
        -> écrit public/academy/livrables/en/04-dashboard.html

Le JSON de traduction a la même forme que celui d'extraction : la clé est
l'indice du nœud, la valeur son texte. Une clé absente garde le texte français,
ce qui laisse passer les noms propres et les nombres sans avoir à les recopier.
"""

import io
import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "public" / "academy" / "livrables"
DEST = SOURCE / "en"

# Ce qui n'est pas du texte lisible : on n'y touche pas.
HORS = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.S | re.I)


def noeuds(html: str):
    """Les nœuds de texte du corps, avec leur position. Ordre du document."""
    masque = bytearray(b"\x00") * len(html)
    for m in HORS.finditer(html):
        for i in range(m.start(), m.end()):
            masque[i] = 1
    for m in re.finditer(r">([^<>]+)<", html):
        texte = m.group(1)
        if masque[m.start(1)]:
            continue
        if not texte.strip() or not re.search(r"[A-Za-zÀ-ÿ]", texte):
            continue
        yield m.start(1), m.end(1), texte


def extraire(nom: str) -> None:
    html = io.open(SOURCE / f"{nom}.html", encoding="utf-8").read()
    sortie = {str(i): t for i, (_, _, t) in enumerate(noeuds(html))}
    cible = Path(sys.argv[3]) if len(sys.argv) > 3 else RACINE / f"{nom}.textes.json"
    io.open(cible, "w", encoding="utf-8", newline="\n").write(
        json.dumps(sortie, ensure_ascii=False, indent=1) + "\n"
    )
    print(f"{len(sortie)} nœuds -> {cible}")


def injecter(nom: str, chemin_trad: str) -> None:
    html = io.open(SOURCE / f"{nom}.html", encoding="utf-8").read()
    trad = json.load(io.open(chemin_trad, encoding="utf-8"))
    morceaux, precedent, remplaces = [], 0, 0
    for i, (debut, fin, texte) in enumerate(noeuds(html)):
        neuf = trad.get(str(i))
        if neuf is None or neuf == texte:
            continue
        morceaux.append(html[precedent:debut])
        morceaux.append(neuf)
        precedent = fin
        remplaces += 1
    morceaux.append(html[precedent:])
    resultat = "".join(morceaux).replace('<html lang="fr"', '<html lang="en"')
    DEST.mkdir(parents=True, exist_ok=True)
    io.open(DEST / f"{nom}.html", "w", encoding="utf-8", newline="\n").write(resultat)
    print(f"{remplaces} nœuds traduits -> {DEST / f'{nom}.html'}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    if sys.argv[1] == "extraire":
        extraire(sys.argv[2])
    elif sys.argv[1] == "injecter":
        injecter(sys.argv[2], sys.argv[3])
    else:
        raise SystemExit(__doc__)

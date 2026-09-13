#!/usr/bin/env python3
"""Rafraîchit l'instantané des leçons des quatre modules outils.

Depuis le 13/09/2026, `GET /api/academy/public/jour30` sert `modulesOutils` :
les leçons de chaque module outil, dans l'ordre, avec leur durée. Les pages
outils le lisent au build puis dans le navigateur, exactement comme les prix.
Cet instantané n'est plus que le secours, pour le jour où l'application ne
répond pas pendant un build.

⚠️ Il remplace une extraction faite à la main depuis
`mydigipal-academy/atelier/contenu/lot2/`, qui était périmée : elle annonçait
huit leçons et quarante-neuf minutes pour le module Claude, là où la production
en sert onze et soixante-quinze. Ne plus repartir des fichiers du dépôt.

    python scripts/instantane-lecons-outils.py
"""

import io
import json
import urllib.request
from pathlib import Path

API = "https://academy.mydigipal.com/api/academy/public/jour30?lang={lang}"
DEST = Path(__file__).resolve().parent.parent / "src" / "data" / "academy" / "lecons-outils.json"


def lire(lang: str) -> dict:
    # urlopen puis decode('utf-8') : un pipe vers Python lirait la réponse dans
    # la page de code de la console et doublerait l'encodage des accents.
    with urllib.request.urlopen(API.format(lang=lang), timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def main() -> None:
    fr = lire("fr")
    en = lire("en")
    if not fr.get("modulesOutils"):
        raise SystemExit("l'application ne sert pas modulesOutils : instantané inchangé")

    sortie = {}
    for outil, m in fr["modulesOutils"].items():
        if not m:
            raise SystemExit(f"module {outil} absent de la réponse : instantané inchangé")
        anglais = (en.get("modulesOutils") or {}).get(outil) or {}
        par_id = {l["id"]: l for l in anglais.get("lecons", [])}
        sortie[outil] = {
            "module_id": m["module_id"],
            "minutes": m["minutes"],
            "titre": m.get("titre"),
            "lecons": [
                {
                    "id": l["id"],
                    "minutes": l["minutes"],
                    # Le titre arrive déjà localisé dans les deux langues ; on
                    # garde la forme {fr, en} attendue par la page.
                    "titre": l["titre"]
                    if isinstance(l["titre"], dict)
                    else {"fr": l["titre"], "en": par_id.get(l["id"], {}).get("titre", l["titre"])},
                }
                for l in m["lecons"]
            ],
        }

    io.open(DEST, "w", encoding="utf-8", newline="\n").write(
        json.dumps(sortie, ensure_ascii=False, indent=2) + "\n"
    )
    for outil, m in sortie.items():
        print(f"  {outil:8} {m['module_id']}  {len(m['lecons']):2} leçons  {m['minutes']:3} min")
    print(f"\n{DEST}")


if __name__ == "__main__":
    main()

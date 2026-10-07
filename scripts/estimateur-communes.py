"""La population des communes françaises, réduite en grille, pour l'estimateur des études
de cas automobiles (`src/components/etudes/EstimateurAuto.astro`).

Source : l'API Découpage administratif (geo.api.gouv.fr), populations municipales INSEE,
centre de chaque commune. On ne garde que ce qu'il faut pour compter la population dans
un rayon : la population est cumulée dans des cellules de PAS degrés (environ 4 km de
côté en métropole), repérées par leur indice entier. Les communes de 5 000 habitants et
plus gardent leur nom et leur centre : elles servent de suggestions si l'API de recherche
ne répond pas depuis le navigateur.

Sortie : public/data/estimateur-communes.json (chargé seulement quand le visiteur ouvre
l'estimateur). À relancer quand l'INSEE publie de nouvelles populations :
    python scripts/estimateur-communes.py
"""
from __future__ import annotations

import gzip
import io
import json
import math
import urllib.request
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'public' / 'data' / 'estimateur-communes.json'
URL = 'https://geo.api.gouv.fr/communes?fields=nom,centre,population,codeDepartement&format=json&geometry=centre'
PAS = 0.04          # taille d'une cellule, en degrés (latitude comme longitude)
SEUIL_NOM = 5000    # population à partir de laquelle une commune garde son nom


def telecharger() -> list[dict]:
    req = urllib.request.Request(URL, headers={'Accept-Encoding': 'gzip', 'User-Agent': 'mydigipal-estimateur'})
    with urllib.request.urlopen(req, timeout=120) as r:
        brut = r.read()
        if r.headers.get('Content-Encoding') == 'gzip':
            brut = gzip.decompress(brut)
    return json.loads(brut.decode('utf-8'))


def main() -> None:
    communes = telecharger()
    cellules: dict[tuple[int, int], int] = {}
    villes = []
    total = 0
    for c in communes:
        pop = c.get('population') or 0
        centre = (c.get('centre') or {}).get('coordinates')
        if not pop or not centre:
            continue
        lon, lat = centre
        cle = (math.floor(lat / PAS), math.floor(lon / PAS))
        cellules[cle] = cellules.get(cle, 0) + pop
        total += pop
        if pop >= SEUIL_NOM:
            villes.append([c['nom'], c.get('codeDepartement', ''), round(lat, 3), round(lon, 3), pop])

    # Cellules triées, puis codées en écart au précédent : le fichier se compresse bien mieux.
    plat = []
    pi = pj = 0
    for (i, j) in sorted(cellules):
        plat += [i - pi, j - pj, cellules[(i, j)]]
        pi, pj = i, j
    villes.sort(key=lambda v: -v[4])

    donnees = {
        'source': 'geo.api.gouv.fr (populations municipales INSEE), centre des communes',
        'pas': PAS,
        'communes': len(communes),
        'population': total,
        'cellules': plat,
        'villes': villes,
    }
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    texte = json.dumps(donnees, ensure_ascii=False, separators=(',', ':'))
    with io.open(SORTIE, 'w', encoding='utf-8', newline='\n') as f:
        f.write(texte)
    brut = len(texte.encode('utf-8'))
    compresse = len(gzip.compress(texte.encode('utf-8'), 9))
    print(f'{len(communes)} communes, {len(cellules)} cellules, {len(villes)} villes nommées, population {total:,}')
    print(f'{SORTIE.relative_to(RACINE)} : {brut / 1024:.0f} Ko, {compresse / 1024:.0f} Ko compressé')


if __name__ == '__main__':
    main()

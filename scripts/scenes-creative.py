"""Copie les scènes « Creative design » du labo motion dans le site.

Les scènes vivent dans `_shared/motion-lib/labo/essais/crea-*.html` et choisissent leur langue
d'après leur adresse (`/en/` dans le chemin). Ce script les pose dans `public/motion/` et
`public/motion/en/`, avec le lecteur du site (`/motion/lecteur.js`) à la place de celui du labo.
À relancer après toute retouche d'une scène au labo.

Usage : python scripts/scenes-creative.py
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
LABO = SITE.parent / '_shared' / 'motion-lib' / 'labo' / 'essais'
SCENES = ['crea-formats', 'crea-ia-humains', 'crea-revue', 'crea-storyboard', 'crea-volume']


def main() -> None:
    sys.stdout.reconfigure(encoding='utf-8')
    for nom in SCENES:
        src = io.open(LABO / f'{nom}.html', encoding='utf-8').read()
        if '<script src="../lecteur.js"></script>' not in src:
            raise SystemExit(f'{nom} : lecteur du labo introuvable')
        html = src.replace('<script src="../lecteur.js"></script>', '<script src="/motion/lecteur.js"></script>')
        for dossier in (SITE / 'public' / 'motion', SITE / 'public' / 'motion' / 'en'):
            dossier.mkdir(parents=True, exist_ok=True)
            with io.open(dossier / f'{nom}.html', 'w', encoding='utf-8', newline='\n') as f:
                f.write(html)
        print(f'{nom} : copiée (fr, en)')


if __name__ == '__main__':
    main()

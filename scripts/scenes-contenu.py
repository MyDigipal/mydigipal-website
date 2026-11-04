"""Copie les scènes de la page AI Content (blog et contenu IA) du labo motion dans le site.

Même mécanique que `scenes-creative.py` : les scènes vivent dans
`_shared/motion-lib/labo/essais/blog-*.html`, choisissent leur langue d'après leur adresse
(`/en/` dans le chemin) et leur format d'après `?p=1`. Ce script les pose dans `public/motion/`
et `public/motion/en/`, avec le lecteur du site à la place de celui du labo.
À relancer après toute retouche d'une scène au labo.

Usage : python scripts/scenes-contenu.py
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
LABO = SITE.parent / '_shared' / 'motion-lib' / 'labo' / 'essais'
SCENES = ['blog-circuit', 'blog-sujets', 'blog-article', 'blog-regle']


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

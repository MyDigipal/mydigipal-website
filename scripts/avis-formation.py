"""Les chiffres des retours de formation, pour la page AI Training.

Source : l'export des retours (497 lignes, 2022 à 2025), gardé dans le dépôt de l'Academy
(`mydigipal-academy/atelier/retours/`). Le script écrit `src/data/formation/stats-avis.json`,
que la page lit : aucun de ces chiffres ne s'écrit à la main.

La note globale affichée reste celle de l'API de l'Academy (9,4, arbitrage de Paul du
25/08/2026) ; ce fichier n'apporte que ce que l'API ne sert pas : la note de l'animation et
la part des participants qui lui donnent 9 ou 10.

Lancer : python scripts/avis-formation.py
"""
import csv
import io
import json
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
EXPORT = RACINE.parent / 'mydigipal-academy' / 'atelier' / 'retours' / 'Retours_formations_export_2026-08-25.csv'
SORTIE = RACINE / 'src' / 'data' / 'formation' / 'stats-avis.json'

# Les entités d'un même groupe ramenées à la marque.
MARQUE = {
    'pierre fabre benelux': 'Pierre Fabre',
    'galec': 'E.Leclerc',
    'collaboration betters the world (cbtw)': 'CBTW',
    'datawords': 'Datawords',
}


def note(v: str) -> float | None:
    try:
        return float(str(v).replace(',', '.'))
    except ValueError:
        return None


def main() -> None:
    lignes = list(csv.DictReader(io.open(EXPORT, encoding='utf-8-sig')))
    trainers = [n for r in lignes if (n := note(r['Prestations trainers'])) is not None]
    globales = [n for r in lignes if (n := note(r['Note Globale (sur 10)'])) is not None]
    societes = set()
    for r in lignes:
        brut = r['Airtable Lead ID'].strip().strip('"').split(' - ')[0].strip()
        societes.add(MARQUE.get(brut.lower(), brut))
    stats = {
        'source': EXPORT.name,
        'retours': len(lignes),
        'animation': {
            'moyenne': round(sum(trainers) / len(trainers), 1),
            'notes': len(trainers),
            'part9et10': round(100 * sum(n >= 9 for n in trainers) / len(trainers)),
        },
        'globale': {
            'part9et10': round(100 * sum(n >= 9 for n in globales) / len(globales)),
            'notes': len(globales),
        },
        'entreprises': len(societes),
    }
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    io.open(SORTIE, 'w', encoding='utf-8', newline='\n').write(json.dumps(stats, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(stats, ensure_ascii=False))
    print('entreprises :', sorted(societes))


if __name__ == '__main__':
    main()

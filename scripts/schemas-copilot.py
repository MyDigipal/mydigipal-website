#!/usr/bin/env python3
"""Fabrique les deux écrans de la console Copilot.

Pourquoi ils sont dessinés et non capturés : l'application Academy n'a aucune
capture de Copilot, et Paul n'a pas de licence Microsoft 365 Copilot (13/09/2026).
Il avait proposé d'en prendre sur internet ; ce sont des visuels Microsoft sous
droits, et les poser sur une page commerciale n'est pas une bonne idée.

Ce ne sont donc PAS de fausses captures : ce sont deux schémas, dans le langage
visuel de la salle de nuit, qui disent ce qu'aucune capture ne montre - où vit
Copilot, et ce qu'il voit de l'entreprise. La console les annonce comme des
schémas, pas comme des écrans.

    python scripts/schemas-copilot.py
"""

import io
from pathlib import Path
from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "public" / "academy" / "outils" / "copilot"

STYLE = """
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:760px;background:#0d1424;color:#b9c1d1;
       font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;
       padding:38px 44px;-webkit-font-smoothing:antialiased}
  .fil{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;
       text-transform:uppercase;color:#c8a951;margin-bottom:10px}
  h1{font-size:30px;font-weight:600;color:#f2eee4;letter-spacing:-.02em;margin-bottom:6px}
  .sous{font-size:15px;color:#7d879b;margin-bottom:26px;max-width:74ch}
  .grille{display:grid;gap:14px;flex:1}
  .app{border:1px solid #26324e;border-radius:14px;background:#141d33;padding:18px 20px;
       display:flex;flex-direction:column}
  .app h2{font-size:17px;font-weight:600;color:#f2eee4;margin-bottom:3px}
  .app .r{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.14em;
          text-transform:uppercase;color:#8a6d24;margin-bottom:9px}
  .app p{font-size:13.5px;line-height:1.5;color:#b9c1d1}
  .app .non{font-size:12.5px;color:#7d879b;margin-top:auto;padding-top:10px;
            border-top:1px solid #26324e}
  .app .non b{color:#d9743f;font-weight:500}
  .centre{border-color:#c8a951;background:linear-gradient(180deg,rgba(200,169,81,.12),rgba(200,169,81,.03))}
  .centre h2{color:#dcbc66}
  .flot{display:flex;gap:14px;flex:1}
  .col{flex:1;display:flex;flex-direction:column;gap:14px}
  .src{border:1px solid #26324e;border-radius:12px;background:#141d33;padding:14px 16px}
  .src h3{font-size:15px;color:#f2eee4;font-weight:600;margin-bottom:3px}
  .src p{font-size:12.5px;color:#7d879b;line-height:1.45}
  .mur{border:1px dashed #d9743f;border-radius:14px;background:rgba(217,116,63,.06);
       padding:18px 20px;display:flex;flex-direction:column;justify-content:center}
  .mur h2{font-size:17px;color:#f2eee4;font-weight:600;margin-bottom:8px}
  .mur li{list-style:none;font-size:13px;color:#b9c1d1;padding:5px 0 5px 16px;position:relative}
  .mur li::before{content:'';position:absolute;left:0;top:13px;width:8px;height:1px;background:#d9743f}
"""

PORTES = """
  <p class="fil">Microsoft 365 Copilot</p>
  <h1>Cinq portes, et elles ne font pas la même chose</h1>
  <p class="sous">Copilot n'est pas une conversation à côté du travail : c'est un volet dans chaque
  application, et ce qu'il sait faire change de l'une à l'autre. Le parcours consacre une leçon à chacune.</p>
  <div class="grille" style="grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr">
    <div class="app"><p class="r">Word</p><h2>Écrire et réécrire</h2>
      <p>Un brouillon depuis des notes, un résumé en cinq points, une réécriture qui garde le sens.
      Le volet voit le document ouvert.</p>
      <p class="non"><b>Ce qu'il ne fait pas :</b> la mise en page fine reste à vous.</p></div>
    <div class="app"><p class="r">Excel</p><h2>Lire un tableau</h2>
      <p>Une formule expliquée, une colonne calculée, une tendance repérée dans des données
      structurées en vraie table.</p>
      <p class="non"><b>Ce qu'il ne fait pas :</b> les gros classeurs et les onglets en désordre le perdent.</p></div>
    <div class="app"><p class="r">PowerPoint</p><h2>Monter une trame</h2>
      <p>Des diapositives depuis un document Word, réorganisées à la demande, avec les notes
      de l'orateur.</p>
      <p class="non"><b>Ce qu'il ne fait pas :</b> le résultat demande toujours une passe humaine.</p></div>
    <div class="app"><p class="r">Outlook</p><h2>Trier et répondre</h2>
      <p>Le résumé d'un fil de trente messages, un brouillon de réponse dans votre ton, les points
      à retenir avant une réunion.</p>
      <p class="non"><b>Ce qu'il ne fait pas :</b> il n'envoie rien sans vous.</p></div>
    <div class="app centre"><p class="r">Le chat Microsoft 365</p><h2>Chercher dans l'entreprise</h2>
      <p>La porte la plus puissante, et la moins connue : il cherche dans vos fichiers, vos courriels
      et vos réunions à la fois.</p>
      <p class="non"><b>Condition :</b> la licence Copilot, et des documents rangés.</p></div>
    <div class="app"><p class="r">Teams</p><h2>Suivre une réunion</h2>
      <p>Le compte rendu, les décisions, les actions avec leur porteur. Même quand on arrive
      en retard.</p>
      <p class="non"><b>Ce qu'il ne fait pas :</b> il faut que la réunion soit transcrite.</p></div>
  </div>
"""

VOIT = """
  <p class="fil">Ce que Copilot voit de vous</p>
  <h1>Il ne répond bien que sur ce qu'il a le droit de lire</h1>
  <p class="sous">C'est la différence de fond avec les trois autres outils, et la source de la
  plupart des déceptions : Copilot cherche dans les données de l'entreprise, mais seulement celles
  auxquelles vous avez déjà accès, et seulement si elles sont indexées.</p>
  <div class="flot">
    <div class="col">
      <div class="src"><h3>SharePoint et OneDrive</h3><p>Les fichiers de vos équipes, dans la mesure
      où vous y avez déjà accès. Un dossier auquel vous n'avez pas droit reste invisible.</p></div>
      <div class="src"><h3>Outlook</h3><p>Vos courriels et vos pièces jointes. Pas ceux de vos
      collègues, même en copie.</p></div>
      <div class="src"><h3>Teams</h3><p>Les conversations et les réunions transcrites. Une réunion
      sans transcription n'existe pas pour lui.</p></div>
      <div class="src"><h3>Le calendrier</h3><p>Vos rendez-vous, leurs participants et leurs
      documents joints.</p></div>
    </div>
    <div class="col" style="flex:1.1">
      <div class="mur" style="flex:1">
        <h2>Ce qu'il ne voit pas, et qu'on croit qu'il voit</h2>
        <ul>
          <li>Les fichiers restés sur un disque local ou une clé.</li>
          <li>Les documents d'un service auquel vous n'avez pas accès.</li>
          <li>Les réunions non transcrites, et les appels téléphoniques.</li>
          <li>Les outils hors Microsoft : le CRM, la comptabilité, le logiciel métier.</li>
          <li>Ce qui a été déposé il y a dix minutes : l'indexation prend du temps.</li>
        </ul>
      </div>
      <div class="src" style="border-color:#c8a951">
        <h3 style="color:#dcbc66">La conséquence, dans la formation</h3>
        <p>Deux leçons portent là-dessus : ce qu'on peut lui donner à lire, et ce qu'on écrit dans
        la demande quand il ne trouve pas. Une entreprise mal rangée obtient des réponses vagues,
        et c'est rarement la faute de l'outil.</p>
      </div>
    </div>
  </div>
"""


def page(corps: str) -> str:
    return f"<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'><style>{STYLE}</style></head><body>{corps}</body></html>"


def main() -> None:
    SORTIE.mkdir(parents=True, exist_ok=True)
    travail = SORTIE / "_schema.html"
    with sync_playwright() as p:
        # `channel="chrome"` : le chromium embarque de Playwright disparait a chaque
        # mise a jour du paquet tant que `playwright install` n'est pas relance.
        # Le Chrome du poste, lui, est toujours la.
        nav = p.chromium.launch(channel="chrome")
        page_nav = nav.new_page(viewport={"width": 1200, "height": 760}, device_scale_factor=1.5)
        for nom, corps in [("portes", PORTES), ("ce-qu-il-voit", VOIT)]:
            io.open(travail, "w", encoding="utf-8", newline="\n").write(page(corps))
            page_nav.goto(travail.as_uri())
            page_nav.wait_for_timeout(900)
            cible = SORTIE / f"{nom}.png"
            page_nav.screenshot(path=str(cible))
            print(f"  {nom:16} {cible.stat().st_size // 1024:4} Ko")
        nav.close()
    travail.unlink(missing_ok=True)


if __name__ == "__main__":
    main()

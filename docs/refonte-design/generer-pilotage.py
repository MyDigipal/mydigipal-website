#!/usr/bin/env python3
"""Génère docs/refonte-design/pilotage.html à partir du gabarit et des mesures de l'audit.

Le document de pilotage est le SEUL document d'état du chantier. Pour le mettre à jour :
modifier les listes ci-dessous (état d'une page, question tranchée, ligne de journal),
puis relancer `python docs/refonte-design/generer-pilotage.py`.
"""

import html
import io
import re
from pathlib import Path

ICI = Path(__file__).parent
GABARIT = ICI / "_gabarit-pilotage.html"
SORTIE = ICI / "pilotage.html"
DATE = "30/09/2026"
PAS = 30  # un échantillon de la ligne de sondage tous les 30 px
PIED = 15  # le pied de page fait environ 15 échantillons (450 px)

INSECABLE = chr(0x00A0)
FINE = chr(0x202F)

# ---------------------------------------------------------------------------------------
# Mesures du 29/09/2026, production, anglais, 1 440 px.
# page | hauteur | bande (b blanc, t teinte claire, B bleu, N sombre ; longueur en échantillons)
# ---------------------------------------------------------------------------------------
LIGNES = """
/|10646|b33N100b33t52b56t29b37N15
/contact|3706|b3t65b42N14
/calculator|1807|b3t43N15
/academy|16222|N33t70N115t61N132t23b39N68
/academy/claude|8677|N181t31N78
/academy/copilot|7726|N149t30N79
/academy/chatgpt|7586|N144t31N78
/academy/gemini|7637|N146t30N79
/blog|16063|b17t504N15
/case-studies|2775|b17t61N15
/services|4238|b83t27b3t14N15
/ai|6155|b103t15b52t4b2t15N14
/automotive|5073|b21t6b63t16b15t34N14
/privacy-policy|4333|b130N15
/terms-of-service|3876|b115N15
/careers|1464|b34N15
/services/ai-content|8456|b59N22b30N71t5b2t2b29t12b30t5N15
/services/ai-solutions|14188|b25N50b68t40N42t60b88t5b2t2b29t13b29t5N15
/services/ai-training|18591|b24N59t34b31t29b128N40t60b154t12b29t5N15
/services/b2b-abm|10048|b76t34b42N26B19t57b66N15
/services/emailing|9906|b31N36b46t61N86t4b3t14b29t6N15
/services/google-ads|8018|b58t40b37t31N32t4b2t15b28t6N15
/services/paid-social|10191|b61t40b49B10b47t31N32t5b2t14b29t5N15
/services/seo|14534|b118t29N259t4b2t14b39t5N15
/services/tracking-reporting|10888|b54B45b77N26b32N59t4b2t15b29t5N15
/case-studies/dmd-group|8165|b41N15b171t31N14
/case-studies/genesys|7862|b39N15b163t31N14
/case-studies/gwi|7560|b41N16b150t30N15
/case-studies/quantum-metrics|6107|b41N15b103t30N15
/case-studies/symbl-ai|8263|b41N15b175t30N15
/case-studies/theobald-group|9271|b40N15b209t31N14
/case-studies/vulcain-group|9131|b40N15b205t30N15
/automotive/dynamic-ads|8063|b47t27B7b22t64b33t4b3t14b33N15
/automotive/google-ads|8378|b47t27B7b23t64b36t4b3t14b40N15
/automotive/paid-social|8329|b46t27B7b22t64b36t4b3t14b40N15
/contact/merci|1684|b42N14
/blog/abm-content-syndication-networks-quality-vs-quantity-lead-generation|13791|b401t20b11N28
/blog/how-to-rank-on-chatgpt|12653|b363t20b12N27
""".strip().split("\n")

# page : (pastilles numérotées, tirets longs) relevés dans la page rendue
RELEVES = {
    "/": (0, 0), "/contact": (0, 0), "/calculator": (0, 0), "/blog": (0, 0), "/case-studies": (0, 0),
    "/services": (0, 0), "/ai": (0, 2), "/automotive": (4, 0), "/privacy-policy": (0, 0),
    "/terms-of-service": (0, 0), "/careers": (0, 0), "/services/ai-content": (10, 0),
    "/services/ai-solutions": (14, 0), "/services/ai-training": (17, 11), "/services/b2b-abm": (10, 6),
    "/services/emailing": (13, 0), "/services/google-ads": (11, 1), "/services/paid-social": (14, 0),
    "/services/seo": (13, 13), "/services/tracking-reporting": (6, 0), "/case-studies/dmd-group": (0, 7),
    "/case-studies/genesys": (0, 6), "/case-studies/gwi": (0, 13), "/case-studies/quantum-metrics": (0, 6),
    "/case-studies/symbl-ai": (0, 10), "/case-studies/theobald-group": (0, 10),
    "/case-studies/vulcain-group": (0, 9), "/automotive/dynamic-ads": (0, 8),
    "/automotive/google-ads": (0, 0), "/automotive/paid-social": (1, 0), "/contact/merci": (0, 0),
    "/blog/abm-content-syndication-networks-quality-vs-quantity-lead-generation": (0, 1),
    "/blog/how-to-rank-on-chatgpt": (0, 2),
    "/academy": (4, 0), "/academy/claude": (9, 0), "/academy/copilot": (7, 0),
    "/academy/chatgpt": (7, 0), "/academy/gemini": (8, 0),
}

NOMS = {
    "/": "Accueil", "/ai": "IA, page d'entrée", "/services": "Services, page d'entrée",
    "/automotive": "Automobile, page d'entrée", "/contact": "Contact", "/contact/merci": "Contact, merci",
    "/calculator": "Calculateur", "/blog": "Blog, liste", "/case-studies": "Études de cas, liste",
    "/careers": "Recrutement", "/privacy-policy": "Confidentialité", "/terms-of-service": "Conditions",
    "/academy": "Academy, page de vente", "/academy/claude": "Academy, Claude",
    "/academy/copilot": "Academy, Copilot", "/academy/chatgpt": "Academy, ChatGPT",
    "/academy/gemini": "Academy, Gemini",
    "/blog/abm-content-syndication-networks-quality-vs-quantity-lead-generation": "Article de blog (1)",
    "/blog/how-to-rank-on-chatgpt": "Article de blog (2)",
}

GROUPES = [
    ("Groupe 1, les pages intelligence artificielle",
     ["/ai", "/services/ai-training", "/services/ai-solutions", "/services/ai-content"]),
    ("Groupe 2, les pages de services",
     ["/services", "/services/google-ads", "/services/seo", "/services/paid-social", "/services/emailing",
      "/services/b2b-abm", "/services/tracking-reporting"]),
    ("Groupe 3, les pages automobile",
     ["/automotive", "/automotive/google-ads", "/automotive/paid-social", "/automotive/dynamic-ads"]),
    ("Groupe 4, tout le reste",
     ["/case-studies", "/case-studies/theobald-group", "/case-studies/vulcain-group", "/case-studies/dmd-group",
      "/case-studies/genesys", "/case-studies/gwi", "/case-studies/symbl-ai", "/case-studies/quantum-metrics",
      "/blog", "/blog/abm-content-syndication-networks-quality-vs-quantity-lead-generation",
      "/blog/how-to-rank-on-chatgpt", "/contact", "/contact/merci", "/calculator", "/careers",
      "/privacy-policy", "/terms-of-service"]),
    ("Groupe 5, la page d'accueil", ["/"]),
    ("Pour mémoire, les pages de l'Academy (hors chantier)",
     ["/academy", "/academy/claude", "/academy/copilot", "/academy/chatgpt", "/academy/gemini"]),
]


def e(texte: str) -> str:
    return html.escape(texte, quote=False)


def nombre(n: int) -> str:
    """1 234 avec une espace fine insécable."""
    return f"{n:,}".replace(",", FINE)


def lire_bande(bande: str):
    return [(m.group(1), int(m.group(2))) for m in re.finditer(r"([btBNm])(\d+)", bande)]


def analyser(ligne: str):
    page, hauteur, bande = ligne.split("|")
    runs = lire_bande(bande)
    # Le dernier passage sombre est le pied de page ; ce qui dépasse 17 échantillons est du contenu.
    pied = 0
    if runs and runs[-1][0] == "N":
        k, n = runs[-1]
        pied = min(n, PIED) if n <= 17 else PIED
        if "/academy" in page:
            pied = min(n, PIED)
        reste = n - pied
        runs = runs[:-1] + ([("N", reste)] if reste > 0 else []) + [("p", pied)]
    contenu = sum(n for k, n in runs if k != "p")
    sombre = sum(n for k, n in runs if k == "N")
    bleu = sum(n for k, n in runs if k == "B")
    clair, plus_long = 0, 0
    bloc_sombre, plus_long_sombre = 0, 0
    for k, n in runs:
        if k in "bt":
            clair += n
            plus_long = max(plus_long, clair)
        else:
            clair = 0
        if k == "N":
            bloc_sombre += n
            plus_long_sombre = max(plus_long_sombre, bloc_sombre)
        else:
            bloc_sombre = 0
    return {
        "page": page, "hauteur": int(hauteur), "runs": runs,
        "sombre": round(100 * sombre / contenu) if contenu else 0,
        "bleu": round(100 * bleu / contenu) if contenu else 0,
        "clair": plus_long * PAS, "bloc_sombre": plus_long_sombre * PAS,
        "pastilles": RELEVES.get(page, (0, 0))[0], "tirets": RELEVES.get(page, (0, 0))[1],
    }


MESURES = {m["page"]: m for m in (analyser(l) for l in LIGNES)}


def nom(page: str) -> str:
    if page in NOMS:
        return NOMS[page]
    parties = page.strip("/").split("/")
    familles = {"services": "Service", "automotive": "Automobile", "case-studies": "Étude de cas"}
    libelle = {
        "ai-training": "AI Training", "ai-solutions": "AI Solutions", "ai-content": "AI Content",
        "google-ads": "Google Ads", "seo": "SEO", "paid-social": "Paid Social", "emailing": "Emailing",
        "b2b-abm": "B2B et ABM", "tracking-reporting": "Tracking et reporting", "dynamic-ads": "Dynamic Ads",
        "theobald-group": "Théobald", "vulcain-group": "Vulcain", "dmd-group": "DMD", "genesys": "Genesys",
        "gwi": "GWI", "symbl-ai": "Symbl.ai", "quantum-metrics": "Quantum Metrics",
    }.get(parties[-1], parties[-1])
    return f"{familles.get(parties[0], parties[0])}, {libelle}"


def bande_html(runs) -> str:
    total = sum(n for _, n in runs) or 1
    morceaux = "".join(
        f'<i class="{k}" style="width:{100 * n / total:.2f}%"></i>' for k, n in runs
    )
    return f'<div class="bande" role="img" aria-label="Suite des fonds de la page">{morceaux}</div>'


def table_rythme() -> str:
    out = []
    for titre, pages in GROUPES:
        out.append(f'<tr class="groupe"><td colspan="7">{e(titre)}</td></tr>')
        for p in pages:
            m = MESURES[p]
            chemin = "/en" + ("" if p == "/" else p)
            if len(chemin) > 34:
                chemin = chemin[:31] + "..."
            sombre = f"{m['sombre']}{INSECABLE}%"
            if m["bleu"]:
                sombre += f"<br><small>et {m['bleu']}{INSECABLE}% de bleu</small>"
            out.append(
                "<tr>"
                f'<td class="page">{e(nom(p))}<small>{e(chemin)}</small></td>'
                f'<td class="n">{nombre(m["hauteur"])}{INSECABLE}px</td>'
                f"<td>{bande_html(m['runs'])}</td>"
                f'<td class="n">{sombre}</td>'
                f'<td class="n">{nombre(m["clair"])}{INSECABLE}px</td>'
                f'<td class="n">{m["pastilles"]}</td>'
                f'<td class="n">{m["tirets"]}</td>'
                "</tr>"
            )
    return "\n".join(out)


def chiffres_cles() -> str:
    agence = [m for p, m in MESURES.items() if not p.startswith("/academy")]
    sans = [m for m in agence if m["sombre"] == 0]
    bloc = max(agence, key=lambda m: m["bloc_sombre"])
    cases = [
        (f"{len(sans)} sur {len(agence)}", "pages de l'agence sans aucune section sombre, pied de page exclu"),
        (f"{nombre(bloc['bloc_sombre'])}{INSECABLE}px", f"de sombre d'un seul bloc sur la page {nom(bloc['page']).split(', ')[-1]} : le sombre ne ponctue pas, il s'entasse"),
        ("61", "fichiers dont le contenu reste invisible tant que le script n'a pas tourné"),
        ("196", "tirets longs dans le code, hors blog et Academy"),
    ]
    return "\n".join(f"<div><b>{v}</b><span>{e(t)}</span></div>" for v, t in cases)


# ---------------------------------------------------------------------------------------
QUESTIONS = [
    ("Q1", "Quelle direction ?",
     "A « Encre », B « Grille » ou C « Atelier ». Tu peux aussi prendre le rythme de l'une et l'animation d'une autre.",
     "La A pour le système, avec l'usine isométrique de la C et le tableau à palettes de la B comme composants. Détail dans la section des directions."),
    ("Q2", "Une seconde couleur qui porte un sens ?",
     "Le 25/09 tu as fixé un seul accent, le bleu du logo. La direction C ajoute un corail réservé au résultat (ce qui sort de la machine, un chiffre de client).",
     "Oui, à cette condition stricte : jamais un bouton, jamais un décor. Dans un schéma, une couleur qui dit « résultat » aide à lire. Les directions A et B s'en passent."),
    ("Q3", "On garde les polices du site ?",
     "A garde Plus Jakarta Sans et Inter. B passe tout en Archivo. C passe les titres en Bricolage Grotesque.",
     "Changer de police change l'en-tête et l'accueil, refaits il y a quatre jours. Je ne le ferais que si la direction te plaît nettement plus."),
    ("Q4", "Que fait-on des chiffres sans source ?",
     "« 8.5B », « 65% », « 200% » sur Google Ads, « 300% / 50+ / 100+ » sur la page IA, « 4.6B », « 760% » sur l'emailing, et bien d'autres.",
     "Je les retire page par page et je les remplace par les chiffres des études de cas. Si tu as la source de certains, donne-la et ils restent, avec leur source affichée."),
    ("Q5", "Le témoignage de la page Google Ads est-il exact ?",
     "Kelly W., Quantum Metrics, y cite +225 % de trafic et -30 % de coût par lead. L'étude de cas Quantum Metrics dit +60 % de taux de clic et -25 % de coût par lead ; +225 % est un chiffre de l'étude DMD.",
     "À vérifier avec toi avant de le garder. Dans les maquettes, j'ai pris le verbatim de l'étude Théobald, qui est sur un compte Google Ads."),
    ("Q6", "Un contrôle des chiffres pour le site ?",
     "check-chiffres.mjs vit dans le dépôt de l'Academy et ne regarde que ses faits. Rien ne contrôle les pages de l'agence.",
     "Oui : un script du site qui arrête le build sur un chiffre absent des études de cas, du moteur du calculateur ou d'une liste blanche sourcée. Je l'écris avec le groupe 1."),
    ("Q7", "AI Content reste-t-elle une page à part ?",
     "Question que tu avais laissée ouverte le 25/08 : « c'est un peu des automatisations qu'on crée ».",
     "Je la garde en page pour le référencement, et je la relie plus nettement à AI Solutions. À trancher avant le groupe 1."),
    ("Q8", "Les tirets longs et les pastilles, au passage ?",
     "196 tirets longs et 15 composants à pastilles numérotées dans le code.",
     "Oui, corrigés page par page dans le groupe de la page. Les études de cas (72 tirets) passent avec le groupe 4."),
    ("Q9", "Les logos des outils sur les pages IA ?",
     "La grille « 20+ platforms » montre des pastilles de couleur à initiales à la place des logos.",
     "De vrais logos en une seule couleur, comme sur la page de vente de l'Academy (sources libres, usage nominatif), ou les noms seuls. Pas de pastilles."),
    ("Q10", "Les transitions entre pages ?",
     "@view-transition reste à décider depuis le 25/09 : elle ne joue que si tout le site la déclare.",
     "Je la propose à la fin du chantier, quand toutes les pages partagent le même système. Pas avant."),
    ("Q11", "L'intervention vue sur Instagram",
     "La capture reçue montre le titre de la première vignette. Les deux articles publics que j'ai trouvés sur le sujet sont réservés aux abonnés.",
     "Envoie-moi le lien de la publication ou les trois vignettes suivantes : j'en tirerai ce qui vaut pour nos skills de motion design, sans rien supposer."),
]


def questions_html() -> str:
    out = []
    for q, titre, texte, avis in QUESTIONS:
        out.append(
            '<div class="question">'
            f'<div class="q">{q}</div>'
            f"<div><h3>{e(titre)}</h3><p>{e(texte)}</p></div>"
            f'<div class="avis"><b>Mon avis</b>{e(avis)}</div>'
            "</div>"
        )
    return "\n".join(out)


COMPOSANTS = [
    ("Système Encre", "aucun", "Les jetons, les trois fonds de section, les titres, les pilules : ce que toutes les pages partagent.",
     ".section-encre, .section-brume, .section-blanc, .section-monte, .titre-grand, .titre-moyen, .chapo, .rubrique, .pilule",
     "Écrit, dans global.css (étape 1)", "fait"),
    ("Bande de logos", "aucun", "Les clients, immobiles et en gris, entre deux filets.",
     "titre, slugs ou logos", "Écrit, ui/BandeauLogos.astro", "fait"),
    ("Scène (socle)", "courbes-signature", "Le moteur commun : jouer une fois, tenir, rejouer un temps.",
     "tenue, rendu, mode, repères", "Écrit, dans src/lib/motion/", "fait"),
    ("Apparition et titre sous masque", "courbes-signature", "L'ordre de lecture d'une section.",
     "rang dans la section", "Écrit, dans global.css", "fait"),
    ("Éléments flottants", "aucun", "Deux appels, un panneau, un bandeau, sans recouvrement.",
     "hauteur de l'en-tête", "Écrit, dans le socle des maquettes", "fait"),
    ("Carte de verre", "carte-3d", "Un objet, ce qui y entre et ce qui en sort : une campagne, un serveur MCP, un flux de stock.",
     "titre, entrées, sorties, retours, trois textes", "En maquette, direction A", "attente"),
    ("Schéma sur grille", "grille-suisse", "Le même propos, à plat, sur douze colonnes.",
     "entrées, bloc central, sorties, retours", "En maquette, direction B", "attente"),
    ("Scène isométrique", "isometrique", "Un système où quelque chose circule : automatisation, suivi côté serveur, routage d'un lead.",
     "blocs, tapis, jetons, étiquettes", "En maquette, direction C", "attente"),
    ("Morphing sur rail", "morph-formes", "Un process ou une évolution, en trois à cinq états.",
     "stations : titre, texte, forme", "En maquette, directions A, B et C", "attente"),
    ("Tableau à palettes", "tableau-chiffres", "Trois chiffres d'un client.",
     "lignes : chiffre, unité, libellé, source", "En maquette, direction B", "attente"),
    ("Caméra qui tient", "demo-interface", "Une interface, zone par zone : l'Academy, un tableau de bord, une réponse d'IA.",
     "gabarit de l'interface, clés de caméra, repères", "À construire", "afaire"),
    ("Grille de mots", "grille-suisse", "Une méthode nommée en quatre à six mots : CRAFT.",
     "mots, lettres", "À construire", "afaire"),
    ("Révélation en particules", "particules-texte", "Faire apparaître un logo, celui d'un client en tête d'étude de cas.",
     "fichier du logo, densité", "À construire, sous la ligne de flottaison", "afaire"),
    ("Collage", "collage", "Présenter des personnes ou des réalisations.",
     "images, poses", "En maquette, direction C (hero)", "attente"),
]


def table_composants() -> str:
    return "\n".join(
        "<tr>"
        f'<td class="page">{e(n)}</td><td><code>{e(o)}</code></td><td>{e(s)}</td><td>{e(p)}</td>'
        f'<td><span class="etat {c}">{e(etat)}</span></td>'
        "</tr>"
        for n, o, s, p, etat, c in COMPOSANTS
    )


# page : (notion, composant, ce qui est plat)
PAGES = {
    "/ai": ("Quatre façons de mettre l'IA au travail, et par laquelle commencer.",
            "Caméra qui tient, sur l'Academy",
            "Aucune section sombre. « 300% / 50+ / 100+ » sans source. Un tiret cadratin dans un titre. Deux avis hors sujet."),
    "/services/ai-training": ("La méthode CRAFT : cinq champs, une réponse qui tient.",
                              "Grille de mots, puis carte de verre pour le serveur MCP",
                              "Trois animations vides sans script. 17 pastilles, 11 tirets longs. Logos d'outils en pastilles."),
    "/services/ai-solutions": ("Ce que fait une automatisation : un courriel entre, des tâches sortent.",
                               "Scène isométrique, puis carte de verre : un serveur MCP, c'est une prise",
                               "6 990 px clairs d'affilée. 14 pastilles. Six cartes égales."),
    "/services/ai-content": ("De la voix de la marque à l'article relu par un humain.",
                             "Morphing sur rail, quatre états",
                             "Chiffres cités sans lien vers leur source. 10 pastilles."),
    "/services": ("Quel service pour quel objectif.", "Tableau à palettes, trois résultats de clients",
                  "Aucune section sombre. Six cartes égales."),
    "/services/google-ads": ("Comment marche une campagne Performance Max.",
                             "Selon la direction : carte de verre, schéma sur grille ou scène isométrique. Morphing pour la méthode",
                             "12 % de sombre. 11 pastilles. Chiffres sans source."),
    "/services/seo": ("Comment une réponse d'IA choisit ses sources.",
                      "Caméra qui tient, sur une réponse d'IA. Morphing pour l'audit",
                      "7 770 px sombres d'un seul bloc. 13 tirets longs, 13 pastilles."),
    "/services/paid-social": ("Du ciblage au lead : l'audience, la création, le formulaire, le CRM.",
                              "Scène isométrique", "10 % de sombre. 14 pastilles. Cartes égales."),
    "/services/emailing": ("Une séquence qui réagit : un déclencheur, une attente, une branche.",
                           "Scène isométrique", "« 4.6B », « 760% », « 40x » sans source. 13 pastilles."),
    "/services/b2b-abm": ("De la liste de comptes à l'opportunité, en trois paliers.",
                          "Morphing sur rail, trois états", "8 % de sombre. 10 pastilles, 6 tirets longs."),
    "/services/tracking-reporting": ("Le suivi côté serveur : du site au serveur, puis aux plateformes, avec le consentement.",
                                     "Scène isométrique, puis caméra qui tient sur un tableau de bord",
                                     "Le mieux rythmé des services. 6 pastilles."),
    "/automotive": ("Le tunnel d'un concessionnaire, de la recherche à l'essai.", "Morphing sur rail",
                    "Aucune section sombre. 4 pastilles."),
    "/automotive/google-ads": ("Du mot-clé à la fiche du véhicule, puis au lead.",
                               "La scène de la page Google Ads, déclinée pour une concession",
                               "Aucune section sombre, un bandeau bleu. Trois cartes égales, quatre fois."),
    "/automotive/paid-social": ("Le formulaire Meta et son chemin jusqu'au CRM de la concession.", "Scène isométrique",
                                "Aucune section sombre, un bandeau bleu."),
    "/automotive/dynamic-ads": ("Le stock devient l'annonce : le bon véhicule, à la bonne personne.",
                                "Carte de verre, sur le flux de stock",
                                "Aucune section sombre. 8 tirets longs. Chiffres sans source."),
    "/case-studies": ("Aucune.", "Rythme seul", "Aucune section sombre."),
    "/case-studies/theobald-group": ("Les chiffres du client, dans l'ordre où ils sont arrivés.",
                                     "Tableau à palettes, révélation du logo en particules",
                                     "Un seul bandeau de couleur. 7 200 px clairs d'affilée. 10 tirets longs."),
    "/blog": ("Aucune.", "Rythme seul", "15 630 px clairs d'affilée."),
    "/blog/how-to-rank-on-chatgpt": ("Aucune, l'article porte ses propres schémas.", "Rythme seul, en tête et en fin d'article",
                                     "11 850 px clairs d'affilée."),
    "/contact": ("Aucune : la page sert à écrire.", "Rythme seul", "Aucune section sombre."),
    "/calculator": ("Aucune : le calculateur a son parcours.", "Éléments flottants seulement", "Non touché."),
    "/careers": ("Aucune.", "Collage, si la direction C est retenue", "Page courte, sans contraste."),
    "/privacy-policy": ("Aucune.", "Rythme seul", "Texte seul."),
    "/": ("L'Academy, en une vidéo. Le reste se replie.", "Caméra qui tient, dans la partie repliée",
          "3 000 px pour l'Academy, puis 6 210 px clairs."),
}

ETATS = {}  # page : (libellé, classe) quand une page avance


def table_pages() -> str:
    out = []
    regroupes = {
        "/case-studies/theobald-group": "Études de cas (sept pages)",
        "/blog/how-to-rank-on-chatgpt": "Articles de blog",
        "/privacy-policy": "Pages légales et page 404",
        "/contact": "Contact et page de remerciement",
    }
    for titre, pages in GROUPES:
        lignes = [p for p in pages if p in PAGES]
        if not lignes:
            continue
        out.append(f'<tr class="groupe"><td colspan="5">{e(titre)}</td></tr>')
        for p in lignes:
            notion, composant, plat = PAGES[p]
            etat, classe = ETATS.get(p, ("À faire", "afaire"))
            libelle = regroupes.get(p, nom(p))
            out.append(
                "<tr>"
                f'<td class="page">{e(libelle)}</td><td>{e(notion)}</td><td>{e(composant)}</td><td>{e(plat)}</td>'
                f'<td><span class="etat {classe}">{e(etat)}</span></td>'
                "</tr>"
            )
    return "\n".join(out)


CONSTATS_CONTENU = [
    "<strong>Des chiffres sans source, partout.</strong> « 8.5B », « 65% », « 200% », « 3M+ », « 90% » sur Google Ads ; « 300% », « 50+ », « 100+ » sur la page IA ; « 4.6B », « 760% », « 40x » sur l'emailing. Aucun ne vient d'une étude de cas.",
    "<strong>Un témoignage à vérifier</strong> sur la page Google Ads : ses chiffres ne sont pas ceux de l'étude de cas du même client (question Q5).",
    "<strong>196 tirets longs</strong> dans le code, dont un dans un titre de la page IA (« AI Is Not the Future », puis un tiret cadratin).",
    "<strong>15 composants à pastilles numérotées</strong> : les process, les étapes, les avantages.",
    "<strong>Des avis hors sujet</strong> : la page IA montre deux témoignages qui parlent d'emailing et de Google Ads.",
    "<strong>Des logos remplacés par des pastilles</strong> : la grille des outils connectés, sur AI Training et AI Solutions.",
]

DIRECTIONS = """
<div class="directions">
<article class="direction da">
<h3>A. Encre</h3>
<div class="nuancier"><i style="background:#fff"></i><i style="background:#f3f6fa"></i><i style="background:#1d71b8"></i><i style="background:#7db8ee"></i><i style="background:#0b1b2b"></i></div>
<p><strong>La continuité.</strong> La page claire du site, ponctuée par des scènes d'encre où l'on explique. Mêmes polices, même bleu, même en-tête, avec de la profondeur et du volume.</p>
<p><strong>Polices :</strong> Plus Jakarta Sans et Inter, celles du site.</p>
<p><strong>Scène principale :</strong> la carte de verre, avec une phrase à gauche et une à droite.</p>
<p><strong>Aussi :</strong> morphing sur rail pour la méthode.</p>
<div class="liens"><a href="../../labo/refonte-site/direction-a.html?langue=en">Ouvrir en anglais</a><a href="../../labo/refonte-site/direction-a.html?langue=fr">En français</a><a href="../../labo/refonte-site/direction-a.html?fige=1">Figée</a></div>
</article>
<article class="direction db">
<h3>B. Grille</h3>
<div class="nuancier"><i style="background:#fff"></i><i style="background:#f1f2f4"></i><i style="background:#1d71b8"></i><i style="background:#0c1116;outline-color:rgb(255 255 255 / .3)"></i></div>
<p><strong>Le style suisse.</strong> La grille se voit, la typographie porte tout, les aplats ponctuent : du blanc, un noir profond, et le bleu du logo en pleins. Aucune ombre, aucun dégradé.</p>
<p><strong>Police :</strong> Archivo, une seule famille.</p>
<p><strong>Scène principale :</strong> Performance Max en schéma sur douze colonnes.</p>
<p><strong>Aussi :</strong> morphing sur fond bleu, tableau à palettes pour les trois chiffres.</p>
<div class="liens"><a href="../../labo/refonte-site/direction-b.html?langue=en">Ouvrir en anglais</a><a href="../../labo/refonte-site/direction-b.html?langue=fr">En français</a><a href="../../labo/refonte-site/direction-b.html?fige=1">Figée</a></div>
</article>
<article class="direction dc">
<h3>C. Atelier</h3>
<div class="nuancier"><i style="background:#f6f4ef"></i><i style="background:#fff"></i><i style="background:#1d71b8"></i><i style="background:#ff6a4d"></i><i style="background:#0a1626"></i></div>
<p><strong>L'établi.</strong> L'isométrie explique, le papier réchauffe : des feuilles posées, des ombres nettes, une maquette en volume. Le corail ne dit qu'une chose, le résultat.</p>
<p><strong>Polices :</strong> Bricolage Grotesque et Inter.</p>
<p><strong>Scène principale :</strong> l'usine isométrique de Performance Max.</p>
<p><strong>Aussi :</strong> collage dans le hero, morphing du bleu au corail.</p>
<div class="liens"><a href="../../labo/refonte-site/direction-c.html?langue=en">Ouvrir en anglais</a><a href="../../labo/refonte-site/direction-c.html?langue=fr">En français</a><a href="../../labo/refonte-site/direction-c.html?fige=1">Figée</a></div>
</article>
</div>
%%AVIS_DIRECTIONS%%
"""

AVIS_DIRECTIONS = """
<h3>Pour les voir</h3>
<ul>
<li><strong>Sur ton téléphone ou ton ordinateur</strong> : la galerie privée, <a href="https://claude.ai/artifact/K5n2ANkACuuGF78JSbB6Ee">claude.ai/artifact/K5n2ANkACuuGF78JSbB6Ee</a>. Tu y passes d'une direction à l'autre, en anglais ou en français, animée ou figée, et tu y laisses un avis par direction. Je lis ces avis avant de décliner.</li>
<li>En local : <code>python -m http.server 4173</code> dans <code>C:\dev\sv</code>, puis <code>http://localhost:4173/labo/refonte-site/index.html</code> pour les trois côte à côte.</li>
</ul>

<h3>Ce qui a été contrôlé, et ce qui ne l'a pas été</h3>
<div class="defile"><table>
<thead><tr><th>Contrôle, à 390 et 1 440 px, en français et en anglais</th><th>A. Encre</th><th>B. Grille</th><th>C. Atelier</th></tr></thead>
<tbody>
<tr><td>Débordement horizontal</td><td class="n">0</td><td class="n">0</td><td class="n">0</td></tr>
<tr><td>Éléments flottants qui se recouvrent, quatre états</td><td class="n">0</td><td class="n">0</td><td class="n">0</td></tr>
<tr><td>Boutons sur deux lignes, textes rognés</td><td class="n">0</td><td class="n">0</td><td class="n">0</td></tr>
<tr><td>Texte sous 16 px à 390 px</td><td class="n">0</td><td class="n">0</td><td class="n">0</td></tr>
<tr><td>Tirets longs, chiffres hors des études de cas</td><td class="n">0</td><td class="n">0</td><td class="n">0</td></tr>
<tr><td>Page complète sans script et en mode figé</td><td>oui</td><td>oui</td><td>oui</td></tr>
<tr><td>Surface sombre ou pleine, sections</td><td class="n">42 à 45 %</td><td class="n">43 à 46 %</td><td class="n">42 à 45 %</td></tr>
<tr><td>Instants de la scène principale vus à l'écran</td><td class="n">17</td><td class="n">10</td><td class="n">22</td></tr>
</tbody></table></div>
<p style="margin-top:16px"><strong>Non vérifié, pour les trois</strong> : le mouvement lui-même. La fenêtre du navigateur était en arrière-plan, chaque scène a été posée à un instant puis capturée, jamais vue en train de jouer. La fluidité, le déclenchement à l'entrée dans l'écran, un vrai téléphone, Safari et Firefox restent à juger : c'est ton regard qui tranche.</p>

<h3>Mon avis</h3>
<ul>
<li><strong>Je prendrais la A pour le système</strong> : mêmes polices et même en-tête que l'accueil refait il y a quatre jours, donc aucune page à reprendre pour elle. Le rythme est revenu, et la carte de verre est exactement ta demande (une phrase à gauche, une à droite).</li>
<li><strong>Et je garderais deux pièces des autres comme composants</strong> : l'usine isométrique de la C pour tout ce qui circule (une automatisation, le suivi côté serveur, le routage d'un lead), repeinte dans la palette de la A ; le tableau à palettes de la B pour trois chiffres d'un client.</li>
<li>La B est la plus graphique, mais elle change la police et les formes de tout le site, accueil compris. La C demande une seconde couleur et une police de titre.</li>
</ul>

<h3>Les réserves à connaître</h3>
<ul>
<li>Sur téléphone, la scène principale fait environ 1 550 px dans la A et la B, presque deux écrans : les temps 2 et 3 peuvent se jouer sous l'écran. La C règle le problème en gardant le dessin collé sous l'en-tête pendant la lecture. À reprendre dans la direction retenue.</li>
<li>Entre deux formes, l'objet de la méthode passe par une forme sans nom pendant une demi-seconde.</li>
<li>Le verbatim fait cinq à six lignes à 390 px : à couper à trois.</li>
<li>Dans la C, le titre de la section Performance Max est sur la craie et seule la scène est sur la nuit : toute en nuit, la page dépassait 51 % de sombre.</li>
<li>Panneaux compris (hero, format Performance Max, appel final), la A monte à 52 % de surface sombre ou pleine.</li>
</ul>
"""

JOURNAL = [
    ("29/09/2026", "Ouverture du chantier. Copie Drive en retard de 55 commits, travail dans le clone à jour, branche refonte-design."),
    ("29/09/2026", "Lecture de la bibliothèque de mouvement, de tes avis et de la base de la galerie. Digest technique des 12 essais favoris."),
    ("29/09/2026", "Audit en production : 39 gabarits mesurés à 1 440 et à 390 px, tour visuel, éléments flottants, code."),
    ("29/09/2026", "Correctif du bouton du calculateur (bc48cc0) vérifié en production, au bureau et à 390 px. Trois autres recouvrements relevés."),
    ("29/09/2026", "Socle de mouvement écrit et vérifié à l'écran : scènes, courbe A, éléments flottants, mode figé."),
    ("29/09/2026", "Trois directions lancées en maquette sur la page Google Ads : A Encre, B Grille, C Atelier."),
    ("29/09/2026", "Correctif des éléments flottants écrit, construit et vérifié en local (branche flottants-sans-recouvrement, 5b0e768). Non déployé : en attente de ton accord."),
    ("29/09/2026", "Socle porté dans src/lib/motion/. Apparitions du site corrigées sur la branche : contenu visible par défaut, courbe A, septième enfant d'une cascade enfin affiché. Construit, check-seo au vert."),
    ("30/09/2026", "Les trois directions sont livrées, contrôlées à 390 et 1 440 px dans les deux langues, et publiées en galerie privée. Défaut du socle corrigé : au changement de langue, une scène encore sous l'écran restait vide."),
    ("30/09/2026", "Consigne de Paul : limiter la dépense. Plus aucun agent lancé, la suite se fait un groupe à la fois, coût annoncé avant."),
    ("30/09/2026", "Direction A « Encre » retenue par Paul."),
    ("30/09/2026", "Étape 1, le système global, sur la branche refonte-design : jetons et fonds de section dans global.css, HeroService (panneau d'encre, logos entre deux filets), FinalCTA (panneau bleu sur la brume), ServiceFAQ (deux colonnes, sans numéros), TestimonialSpotlight (section d'encre qui monte), CaseStudyCarousel (chiffres lus dans les études de cas, plus aucun chiffre inventé), TrustedBy, PageHero, pied de page en encre. 53 rubriques retirées au-dessus des titres de section. Les questions passent avant l'appel final sur les pages de services."),
    ("30/09/2026", "Vérifié en local (build, check-seo, Chromium) sur 15 gabarits à 1 440, 390 et 360 px : aucun débordement, aucun bouton empilé ni sur deux lignes, un H1 par page, rien d'invisible. Non déployé, donc pas vu sur Render : l'origine Render ne publie que main."),
]


def journal_html() -> str:
    return "\n".join(f"<li><b>{d}</b> {e(t)}</li>" for d, t in JOURNAL)


def main() -> None:
    gabarit = io.open(GABARIT, encoding="utf-8").read()
    directions = DIRECTIONS.replace("%%AVIS_DIRECTIONS%%", AVIS_DIRECTIONS)
    remplacements = {
        "%%DATE%%": DATE,
        "%%QUESTIONS%%": questions_html(),
        "%%CHIFFRES_CLES%%": chiffres_cles(),
        "%%TABLE_RYTHME%%": table_rythme(),
        "%%CONSTATS_CONTENU%%": "\n".join(f"<li>{c}</li>" for c in CONSTATS_CONTENU),
        "%%DIRECTIONS%%": directions,
        "%%TABLE_COMPOSANTS%%": table_composants(),
        "%%TABLE_PAGES%%": table_pages(),
        "%%JOURNAL%%": journal_html(),
    }
    for cle, valeur in remplacements.items():
        assert cle in gabarit, cle
        gabarit = gabarit.replace(cle, valeur)
    assert "%%" not in gabarit, "un jeton du gabarit n'a pas été remplacé"
    interdits = [chr(0x2014), chr(0x2013)]
    for c in interdits:
        assert c not in gabarit, "tiret long dans le document"
    assert not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", gabarit), "caractère de contrôle dans le document"
    io.open(SORTIE, "w", encoding="utf-8", newline="\n").write(gabarit)

    agence = [m for p, m in MESURES.items() if not p.startswith("/academy")]
    print("pages mesurees", len(MESURES), "dont agence", len(agence))
    print("sans sombre", len([m for m in agence if m["sombre"] == 0]))
    print("ecrit", SORTIE, len(gabarit), "caracteres")


if __name__ == "__main__":
    main()

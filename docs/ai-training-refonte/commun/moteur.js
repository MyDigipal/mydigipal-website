/* Moteur de chiffrage des maquettes AI Training (14/10/2026, deuxième version).
   Fonction pure : chiffrer(etat) ne lit rien d'autre que GRILLE. C'est le modèle du futur
   src/lib/formation/moteur.ts. Les prix des séances et du déplacement sont des PROPOSITIONS
   (étude des concurrents du 14/10), en attente de la validation de Paul. Les prix de l'Academy
   viennent de l'API (instantané du 14/10), ramenés hors taxes. */
(function () {
  'use strict';

  const DEVISES = ['EUR', 'GBP', 'USD'];

  const GRILLE = {
    provisoire: true,
    // Prix natifs par devise, jamais convertis au taux du jour.
    durees: {
      '3h': { nom: 'Séance de 3 h', court: '3 h', distance: { EUR: 1200, GBP: 990, USD: 1490 }, site: { EUR: 1400, GBP: 1190, USD: 1790 } },
      jour: { nom: 'Journée complète', court: 'Journée', distance: { EUR: 2100, GBP: 1790, USD: 2690 }, site: { EUR: 2500, GBP: 2150, USD: 3190 } },
    },
    groupeIdeal: [10, 15], // l'idéal pour un atelier ; le découpage proposé vise 15 au plus
    // Majoration d'une séance selon son effectif : de 21 à 50, puis le format webinaire.
    majorations: [[51, 0.5, 'Format webinaire (+50 %)'], [21, 0.15, 'Grand groupe (+15 %)']],
    remises: [[8, 0.2], [5, 0.15], [3, 0.1], [2, 0.05]], // selon le nombre de séances
    // Déplacement depuis Londres : un aller-retour par zone, plus les nuits d'hôtel.
    deplacement: {
      zones: {
        londres: { nom: 'Londres', trajet: { EUR: 0, GBP: 0, USD: 0 } },
        uk: { nom: 'Royaume-Uni, hors Londres', trajet: { EUR: 250, GBP: 220, USD: 290 } },
        paris: { nom: 'Paris', trajet: { EUR: 350, GBP: 300, USD: 400 } },
        france: { nom: 'France et pays voisins', trajet: { EUR: 550, GBP: 480, USD: 640 } },
        europe: { nom: 'Reste de l\'Europe', trajet: { EUR: 750, GBP: 650, USD: 870 } },
        monde: { nom: 'Hors d\'Europe', trajet: null },
      },
      hotel: { EUR: 180, GBP: 160, USD: 210 }, // par nuit
      seancesParJour: { '3h': 2, jour: 1 },
    },
    // Parcours techniques : le double de la grille d'avant (décision du 14/10), sur devis.
    parcours: [
      { nom: 'Construire son serveur MCP', des: { EUR: 3000, GBP: 2600, USD: 3500 } },
      { nom: 'Automatisations sur mesure', des: { EUR: 7000, GBP: 6000, USD: 8100 } },
      { nom: 'Data et business intelligence', des: { EUR: 4400, GBP: 3800, USD: 5100 } },
    ],
    // Academy : prix publics TTC de l'API, ramenés hors taxes (TVA de 20 % en euros et en livres,
    // aucune en dollars), remises d'équipe de l'API.
    academy: { ttc: { EUR: 290, GBP: 250, USD: 340 }, tva: { EUR: 0.2, GBP: 0.2, USD: 0 }, paliers: [[10, 0.25], [5, 0.15], [3, 0.1]], devisDes: 25,
      // Décision de Paul (14/10) : -30 % pour chaque salarié dès qu'une formation est réservée, et pour les
      // entreprises partenaires du client. Elle remplace la remise d'équipe (toujours plus faible).
      avecFormation: 0.3 },
  };

  const ETAT_DEFAUT = { n: 12, duree: '3h', mode: 'distance', zone: 'paris', hotel: false, groupes: 'auto', academy: false, devise: 'EUR' };

  const palier = (table, x) => { for (const [seuil, v] of table) if (x >= seuil) return v; return 0; };
  const majorationDe = (taille) => GRILLE.majorations.find(([seuil]) => taille >= seuil) || null;

  function decoupe(n, k) {
    const base = Math.floor(n / k), reste = n % k;
    return Array.from({ length: k }, (_, i) => base + (i < reste ? 1 : 0));
  }

  function academyHT(devise, n, avecFormation) {
    const a = GRILLE.academy;
    const ht = a.ttc[devise] / (1 + a.tva[devise]);
    return ht * (1 - (avecFormation ? Math.max(a.avecFormation, palier(a.paliers, n)) : palier(a.paliers, n)));
  }

  function chiffrer(e) {
    const g = GRILLE, dv = e.devise || 'EUR';
    const m = (v) => montant(v, 'fr', dv);
    const n = Math.max(1, Math.round(e.n));
    const d = g.durees[e.duree];
    let seances;
    if (e.groupes === 'pleniere') seances = 1;
    else if (typeof e.groupes === 'number') seances = Math.max(1, Math.min(n, e.groupes));
    else seances = Math.ceil(n / g.groupeIdeal[1]);
    const groupes = decoupe(n, seances);
    const prixSeance = d[e.mode === 'site' ? 'site' : 'distance'][dv];
    const lignes = [];

    const brut = seances * prixSeance;
    lignes.push({
      cle: 'seances',
      libelle: `${seances} ${seances > 1 ? 'séances' : 'séance'} ${e.duree === '3h' ? 'de 3 h' : 'à la journée'} ${e.mode === 'site' ? 'en présentiel' : 'à distance'}`,
      detail: seances > 1 ? `${seances} x ${m(prixSeance)}, groupes de ${resumeGroupes(groupes)}` : `${n} ${n > 1 ? 'personnes' : 'personne'}`,
      montant: brut,
    });
    // La majoration porte sur chaque séance selon sa propre taille.
    let majo = 0, libelleMajo = '';
    groupes.forEach((t) => { const mj = majorationDe(t); if (mj) { majo += prixSeance * mj[1]; libelleMajo = mj[2]; } });
    if (majo) lignes.push({ cle: 'majoration', libelle: libelleMajo, detail: groupes[0] > 50 ? 'au-delà de 50 personnes, la séance devient un webinaire' : 'de 21 à 50 personnes dans une séance', montant: majo });

    const tauxRemise = palier(g.remises, seances);
    let remise = 0;
    if (tauxRemise) {
      remise = -(brut + majo) * tauxRemise;
      lignes.push({ cle: 'remise', libelle: `Remise de volume (-${Math.round(tauxRemise * 100)} %)`, detail: `${seances} séances`, montant: remise });
    }

    let deplacement = 0, surDevis = false;
    if (e.mode === 'site') {
      const z = g.deplacement.zones[e.zone] || g.deplacement.zones.paris;
      const jours = Math.ceil(seances / g.deplacement.seancesParJour[e.duree]);
      if (z.trajet == null) {
        surDevis = true;
        lignes.push({ cle: 'deplacement', libelle: 'Déplacement', detail: `${z.nom} : chiffré à la demande`, montant: null });
      } else {
        const trajets = e.hotel ? 1 : jours;
        const nuits = e.hotel ? jours : 0;
        deplacement = trajets * z.trajet[dv] + nuits * g.deplacement.hotel[dv];
        lignes.push({
          cle: 'deplacement',
          libelle: z.trajet[dv] === 0 && !nuits ? 'Déplacement, Londres : compris' : `Déplacement, ${z.nom}`,
          detail: `${jours} ${jours > 1 ? 'jours' : 'jour'} sur place${z.trajet[dv] ? `, ${trajets} ${trajets > 1 ? 'allers-retours' : 'aller-retour'}` : ''}${nuits ? `, ${nuits} ${nuits > 1 ? 'nuits' : 'nuit'} d'hôtel` : ''}`,
          montant: deplacement,
        });
      }
    }

    let academy = 0, academyUnitaire = 0, academyDevis = false;
    if (e.academy) {
      academyUnitaire = academyHT(dv, n, true);
      academy = academyUnitaire * n;
      lignes.push({
        cle: 'academy',
        libelle: `MyDigipal AI Academy, ${n} accès`,
        detail: `${m(academyUnitaire)} HT par personne, -${Math.round(g.academy.avecFormation * 100)} % avec la formation`,
        montant: academy,
      });
    }

    const total = brut + majo + remise + deplacement + academy;
    return { n, seances, groupes, prixSeance, majo, tauxRemise, lignes, total, parPersonne: total / n, surDevis, academyUnitaire, academyDevis, devise: dv };
  }

  function resumeGroupes(gr) {
    const a = gr[0], b = gr[gr.length - 1];
    return a === b ? `${a}` : `${b} à ${a}`;
  }

  /* Une phrase quand elle aide à décider, sinon rien. Les comparaisons portent sur les séances seules. */
  function recommandation(e) {
    const sansAcad = { ...e, academy: false };
    const r = chiffrer(sansAcad), dv = r.devise;
    const m = (v) => montant(v, 'fr', dv);
    if (e.groupes === 'pleniere' && r.n > 50) {
      return e.academy ? '' : `Pour que chacun continue après le webinaire, l'Academy revient à ${m(academyHT(dv, r.n))} HT par personne.`;
    }
    if (e.groupes === 'pleniere' && r.n > 20) {
      const alt = chiffrer({ ...sansAcad, groupes: 'auto' });
      return `En ${alt.seances} groupes de ${resumeGroupes(alt.groupes)}, chacun travaille sur ses propres fichiers : ${m(alt.total)} au lieu de ${m(r.total)}.`;
    }
    if (e.groupes !== 'pleniere' && r.seances >= 3) {
      const alt = chiffrer({ ...sansAcad, groupes: 'pleniere' });
      return `Une seule séance pour les ${r.n} coûterait ${m(alt.total)}, mais personne n'y serait suivi individuellement.`;
    }
    if (r.n <= 3 && !e.academy) {
      return `Pour ${r.n === 1 ? 'une personne' : r.n + ' personnes'}, l'Academy seule revient à ${m(academyHT(dv, r.n))} HT par personne.`;
    }
    return '';
  }

  /* Règle maison : 10 et plus sans décimale, de 1 à 10 une décimale, sous 1 deux.
     En français le symbole suit (« 1 200 € », « 990 £ ») ; en anglais il précède (« €1,200 »). */
  const SYMBOLE = { EUR: '€', GBP: '£', USD: '$' };
  function montant(v, lang = 'fr', devise = 'EUR') {
    if (v == null) return lang === 'fr' ? 'sur devis' : 'on request';
    const a = Math.abs(v);
    const dec = a >= 10 ? 0 : a >= 1 ? 1 : 2;
    const r = Number(v.toFixed(dec));
    const decAff = dec && r % 1 === 0 ? 0 : dec; // jamais de décimale ajoutée à un entier
    const s = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: decAff, maximumFractionDigits: decAff }).format(Math.abs(r));
    const signe = r < 0 ? '-' : '';
    return lang === 'fr' ? `${signe}${s} ${SYMBOLE[devise]}` : `${signe}${SYMBOLE[devise]}${s}`;
  }

  /* L'état dans l'adresse : lisible, pour qu'un lien partagé redonne le même chiffrage. */
  function versAdresse(e) {
    const p = new URLSearchParams({ n: e.n, d: e.duree, m: e.mode, g: e.groupes, a: e.academy ? 1 : 0, c: e.devise });
    if (e.mode === 'site') { p.set('z', e.zone); p.set('h', e.hotel ? 1 : 0); }
    return '#' + p.toString();
  }
  function depuisAdresse(hash, defaut) {
    const p = new URLSearchParams((hash || '').replace(/^#/, ''));
    const base = { ...ETAT_DEFAUT, ...(defaut || {}) };
    if (!p.has('n')) return null;
    const g = p.get('g');
    return {
      n: Math.max(1, Math.min(2000, parseInt(p.get('n'), 10) || base.n)),
      duree: p.get('d') === 'jour' ? 'jour' : '3h',
      mode: p.get('m') === 'site' ? 'site' : 'distance',
      zone: GRILLE.deplacement.zones[p.get('z')] ? p.get('z') : base.zone,
      hotel: p.get('h') === '1',
      groupes: g === 'pleniere' ? 'pleniere' : /^\d+$/.test(g || '') ? parseInt(g, 10) : 'auto',
      academy: p.get('a') === '1',
      devise: DEVISES.includes(p.get('c')) ? p.get('c') : base.devise,
    };
  }

  /* Inclus dans chaque séance : la liste de Paul (14/10) fusionnée avec la page actuelle. */
  const INCLUS = {
    avant: [
      'Un call de diagnostic : où en est l\'équipe avec l\'IA, ses outils, ses usages',
      'Un formulaire à chaque participant, pour personnaliser encore',
      'Plusieurs calls de brief, et des briefs écrits',
      'Un programme bâti sur les cas de votre métier, dans vos outils',
      'L\'accès au contenu avant la séance',
    ],
    pendant: [
      'Une séance animée par un praticien, sur les fichiers de chacun',
      'Un support interactif remis à chaque participant',
    ],
    apres: [
      'L\'enregistrement des séquences, et la transcription écrite',
      'Des recommandations d\'outils adaptées à votre contexte',
    ],
  };

  /* Le sélecteur de devise, posé partout où il y a un prix : un même état pour toute la page. */
  function selecteurDevise(etat, surChangement) {
    const el = document.createElement('div');
    el.className = 'devises';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Devise');
    el.innerHTML = DEVISES.map((d) => `<button type="button" data-devise="${d}">${SYMBOLE[d]} ${d}</button>`).join('');
    el.addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) surChangement(b.dataset.devise); });
    el.maj = () => el.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.devise === etat().devise)));
    return el;
  }

  window.MDP_SIM = { GRILLE, DEVISES, SYMBOLE, ETAT_DEFAUT, chiffrer, recommandation, montant, versAdresse, depuisAdresse, INCLUS, decoupe, academyHT, selecteurDevise };
})();

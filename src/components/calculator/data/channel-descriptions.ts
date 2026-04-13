// Descriptions détaillées des canaux publicitaires
// Utilisé par ChannelCard.tsx pour les popovers hover + modales détaillées

export interface ChannelDescription {
  id: string;
  name: string;
  icon: string;
  // Type d'audience en une ligne
  audienceFr: string;
  audienceEn: string;
  // Force principale (un ou deux mots-clés)
  strengthFr: string;
  strengthEn: string;
  // Avantage unique (1 phrase)
  advantageFr: string;
  advantageEn: string;
  // Point d'attention honnête (1 phrase, pas agressif)
  caveatFr: string;
  caveatEn: string;
  // Usage idéal (1 ligne : quand l'utiliser)
  idealUsageFr: string;
  idealUsageEn: string;
  // Formats publicitaires phares
  adFormatsFr: string[];
  adFormatsEn: string[];
  // Positionnement prix (simple indicateur)
  pricePositionFr: string;
  pricePositionEn: string;
}

export const channelDescriptions: Record<string, ChannelDescription> = {
  meta: {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    icon: '📱',
    audienceFr: 'Grand public, jeunes professionnels, ciblage par intérêts et audiences lookalike',
    audienceEn: 'General public, young professionals, interest-based targeting and lookalike audiences',
    strengthFr: 'Engagement + Conversion',
    strengthEn: 'Engagement + Conversion',
    advantageFr: "Le canal le plus équilibré du marché : reach massif, ciblage précis, CPA prouvé. Les audiences actives permettent une réallocation rapide vers ce qui marche.",
    advantageEn: "The most balanced channel on the market: massive reach, precise targeting, proven CPA. Active audiences allow fast reallocation toward what works.",
    caveatFr: "Demande un pixel correctement configuré et une segmentation d'audience fine. Le ciblage large sous-performe.",
    caveatEn: "Requires a properly configured pixel and fine audience segmentation. Broad targeting underperforms.",
    idealUsageFr: "Pour un reach efficace sur plusieurs démographies avec tracking de conversion prouvé",
    idealUsageEn: "For cost-efficient reach across demographics with proven conversion tracking",
    adFormatsFr: ['Dynamic Ads', 'Lead Gen Forms', 'Reels Ads', 'Stories', 'Advantage+'],
    adFormatsEn: ['Dynamic Ads', 'Lead Gen Forms', 'Reels Ads', 'Stories', 'Advantage+'],
    pricePositionFr: 'Prix moyen : CPM accessible, CPC bas, volume élevé',
    pricePositionEn: 'Mid-range pricing: accessible CPM, low CPC, high volume'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    icon: '💼',
    audienceFr: 'Décideurs B2B, dirigeants, conseillers stratégiques, cadres supérieurs',
    audienceEn: 'B2B decision makers, executives, strategic advisors, senior leaders',
    strengthFr: 'Autorité B2B + Décideurs',
    strengthEn: 'B2B authority + Decision makers',
    advantageFr: "Le seul canal pour toucher les décideurs au ciblage chirurgical. Les Thought Leader Ads atteignent 6.4x le CTR standard et positionnent ta marque comme référence sectorielle.",
    advantageEn: "The only platform for surgical decision-maker targeting. Thought Leader Ads achieve 6.4x standard CTR and position your brand as sector reference.",
    caveatFr: "CPM élevé et coût par prospect le plus cher du marché. Exige du contenu de thought leadership, pas du push produit.",
    caveatEn: "High CPM and the most expensive cost per lead on the market. Requires thought leadership content, not product push.",
    idealUsageFr: "Pour toucher dirigeants et décideurs avec un positionnement d'expertise",
    idealUsageEn: "To reach executives and decision makers with expertise positioning",
    adFormatsFr: ['Sponsored Content', 'Thought Leader Ads', 'InMail', 'Lead Gen Forms', 'Document Ads'],
    adFormatsEn: ['Sponsored Content', 'Thought Leader Ads', 'InMail', 'Lead Gen Forms', 'Document Ads'],
    pricePositionFr: 'Prix élevé : CPM premium mais audience ultra-qualifiée',
    pricePositionEn: 'Premium pricing: high CPM but ultra-qualified audience'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: '🎵',
    audienceFr: 'Gen Z et jeunes millennials 18-30, early adopters, natifs du format vidéo court',
    audienceEn: 'Gen Z and young millennials 18-30, early adopters, short-form video natives',
    strengthFr: 'Notoriété + Potentiel viral',
    strengthEn: 'Awareness + Viral potential',
    advantageFr: "Les Spark Ads délivrent 142% d'engagement en plus et 134% de completion. CPC le plus bas et CTR leader à 2.5%. La voie la moins chère pour toucher les jeunes.",
    advantageEn: "Spark Ads deliver 142% more engagement and 134% higher completion. Lowest CPC and CTR leader at 2.5%. The cheapest path to reach younger audiences.",
    caveatFr: "Multiplicateur de conversion bas (0.6x) : l'audience est orientée découverte, pas conversion immédiate. Demande du contenu natif vidéo.",
    caveatEn: "Low conversion multiplier (0.6x): audience is discovery-oriented, not immediate conversion. Requires native video content.",
    idealUsageFr: "Pour élargir vers une démographie jeune ou tester des concepts créatifs viraux",
    idealUsageEn: "To expand to younger demographics or test viral creative concepts",
    adFormatsFr: ['Spark Ads', 'In-Feed Ads', 'TopView', 'Branded Effects', 'Collection Ads'],
    adFormatsEn: ['Spark Ads', 'In-Feed Ads', 'TopView', 'Branded Effects', 'Collection Ads'],
    pricePositionFr: 'Prix bas : CPM et CPC parmi les plus accessibles du marché',
    pricePositionEn: 'Low pricing: CPM and CPC among the most accessible on the market'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Ads',
    icon: '🎬',
    audienceFr: 'Consommateurs de contenu long, tech-savvy, audiences verticales thématiques',
    audienceEn: 'Long-form content consumers, tech-savvy, vertical thematic audiences',
    strengthFr: 'Notoriété + Construction de marque',
    strengthEn: 'Awareness + Brand building',
    advantageFr: "Le meilleur coût par minute d'attention pour raconter une histoire. Format idéal pour l'éducation produit et le brand storytelling.",
    advantageEn: "Best cost per minute of attention for storytelling. Ideal format for product education and brand storytelling.",
    caveatFr: "Multiplicateur de conversion à 0.75x : optimisé pour la vue complète, pas la conversion directe. Demande du contenu vidéo de qualité.",
    caveatEn: "Conversion multiplier at 0.75x: optimized for view completion, not direct conversion. Requires quality video content.",
    idealUsageFr: "Pour campagnes notoriété ou amplifier du contenu vidéo éducatif",
    idealUsageEn: "For awareness campaigns or amplifying educational video content",
    adFormatsFr: ['In-Stream Skippable', 'Bumper Ads', 'Discovery Ads', 'Shorts Ads', 'Masthead'],
    adFormatsEn: ['In-Stream Skippable', 'Bumper Ads', 'Discovery Ads', 'Shorts Ads', 'Masthead'],
    pricePositionFr: 'Prix moyen : CPV compétitif, excellent reach vidéo',
    pricePositionEn: 'Mid-range pricing: competitive CPV, excellent video reach'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit Ads',
    icon: '👽',
    audienceFr: 'Communautés tech, subreddits de niche, audiences sceptiques et analytiques',
    audienceEn: 'Tech communities, niche subreddits, skeptical and analytical audiences',
    strengthFr: 'Intent + Engagement profond',
    strengthEn: 'Intent + Deep engagement',
    advantageFr: "CPC très bas avec un engagement profond sur les communautés thématiques. Les subreddits sont pré-filtrés par pertinence : tu parles à des gens déjà intéressés.",
    advantageEn: "Very low CPC with deep engagement in themed communities. Subreddits are pre-filtered by relevance: you speak to people already interested.",
    caveatFr: "CTR faible (0.5%) et demande de connaître la culture des subreddits. Une approche native est essentielle : le ton promo tue la performance.",
    caveatEn: "Low CTR (0.5%) and requires knowledge of subreddit culture. Native approach is essential: promotional tone kills performance.",
    idealUsageFr: "Pour toucher des communautés tech/AI à haut intent ou construire de l'advocacy",
    idealUsageEn: "To reach high-intent tech/AI communities or build advocacy",
    adFormatsFr: ['Promoted Posts', 'Conversation Ads', 'Free-form Ads', 'Video Ads'],
    adFormatsEn: ['Promoted Posts', 'Conversation Ads', 'Free-form Ads', 'Video Ads'],
    pricePositionFr: 'Prix bas : CPC parmi les plus bas pour du contenu natif',
    pricePositionEn: 'Low pricing: CPC among the lowest for native content'
  },
  x: {
    id: 'x',
    name: 'X (Twitter) Ads',
    icon: '🐦',
    audienceFr: 'Participants aux débats publics, leaders d\'opinion, suivi des actus temps réel',
    audienceEn: 'Public debate participants, opinion leaders, real-time news followers',
    strengthFr: 'Engagement + Temps réel',
    strengthEn: 'Engagement + Real-time',
    advantageFr: "Accès direct aux conversations politiques, tech et culturelles en temps réel. Promoted Posts se fondent dans le fil : ultra natif.",
    advantageEn: "Direct access to political, tech and cultural real-time conversations. Promoted Posts blend into the feed: ultra native.",
    caveatFr: "Multiplicateur de conversion à 0.8x : l'algorithme favorise l'engagement pas la conversion. Demande un hook message fort.",
    caveatEn: "Conversion multiplier at 0.8x: algorithm favors engagement not conversion. Requires a strong message hook.",
    idealUsageFr: "Pour insérer un message dans des discussions actives ou toucher des influenceurs sectoriels",
    idealUsageEn: "To insert a message in active discussions or reach sector influencers",
    adFormatsFr: ['Promoted Posts', 'Follower Ads', 'Vertical Video Ads', 'Takeover'],
    adFormatsEn: ['Promoted Posts', 'Follower Ads', 'Vertical Video Ads', 'Takeover'],
    pricePositionFr: 'Prix moyen : CPM variable selon la période et les sujets',
    pricePositionEn: 'Mid-range pricing: CPM varies by period and topics'
  },
  display: {
    id: 'display',
    name: 'Display & Programmatic',
    icon: '🖥️',
    audienceFr: 'Audiences de remarketing, visiteurs web, ciblage contextuel thématique',
    audienceEn: 'Remarketing audiences, web visitors, contextual thematic targeting',
    strengthFr: 'Remarketing + Reach',
    strengthEn: 'Remarketing + Reach',
    advantageFr: "Le CPM le plus bas du marché et la plus forte fréquence (5x) pour multiplier le reach à moindre coût. Imbattable pour le remarketing cross-canal.",
    advantageEn: "Lowest CPM on the market and highest frequency (5x) to multiply reach at low cost. Unbeatable for cross-channel remarketing.",
    caveatFr: "CTR bas (0.4%). Demande une infrastructure de tracking propre : inutile sans pixels et audiences bien configurés.",
    caveatEn: "Low CTR (0.4%). Requires clean tracking infrastructure: useless without well-configured pixels and audiences.",
    idealUsageFr: "Pour campagnes remarketing ou reach massif au coût le plus bas",
    idealUsageEn: "For remarketing campaigns or massive reach at the lowest cost",
    adFormatsFr: ['Responsive Display', 'Image Banners', 'Video Banners', 'Contextual Targeting'],
    adFormatsEn: ['Responsive Display', 'Image Banners', 'Video Banners', 'Contextual Targeting'],
    pricePositionFr: 'Prix très bas : CPM le plus accessible du portfolio',
    pricePositionEn: 'Very low pricing: most accessible CPM of the portfolio'
  },
  'google-display': {
    id: 'google-display',
    name: 'Google Display & YouTube',
    icon: '🎬',
    audienceFr: 'Reach cross-canal, audiences affinitaires, remarketing et contextuel',
    audienceEn: 'Cross-channel reach, affinity audiences, remarketing and contextual',
    strengthFr: 'Reach + Remarketing',
    strengthEn: 'Reach + Remarketing',
    advantageFr: "Combine la portée de 2M+ sites partenaires + YouTube. Remarketing cross-canal ultra-efficace grâce à la taille du réseau Google.",
    advantageEn: "Combines reach of 2M+ partner sites + YouTube. Ultra-efficient cross-channel remarketing thanks to Google network size.",
    caveatFr: "Qualité variable des emplacements sans exclusions propres. Demande un travail de placement exclusion régulier.",
    caveatEn: "Variable placement quality without proper exclusions. Requires regular placement exclusion work.",
    idealUsageFr: "Pour remarketing massif ou amplification de notoriété multi-format",
    idealUsageEn: "For massive remarketing or multi-format awareness amplification",
    adFormatsFr: ['Responsive Display', 'YouTube Ads', 'Discovery Ads', 'Gmail Ads'],
    adFormatsEn: ['Responsive Display', 'YouTube Ads', 'Discovery Ads', 'Gmail Ads'],
    pricePositionFr: 'Prix bas : CPM accessible, excellent volume cross-canal',
    pricePositionEn: 'Low pricing: accessible CPM, excellent cross-channel volume'
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google Search',
    icon: '🔍',
    audienceFr: 'Utilisateurs en recherche active, intent élevé, décideurs et chercheurs qualifiés',
    audienceEn: 'Users in active search, high intent, qualified decision makers and researchers',
    strengthFr: 'Conversion + Intent',
    strengthEn: 'Conversion + Intent',
    advantageFr: "Le multiplicateur de conversion le plus élevé (2.5x) avec un CTR à 5.74%. Tu ne paies que quand quelqu'un cherche activement ta solution.",
    advantageEn: "Highest conversion multiplier (2.5x) with 5.74% CTR. You only pay when someone actively searches for your solution.",
    caveatFr: "CPM et CPC les plus élevés du portfolio sur les mots-clés concurrentiels. Demande une recherche de mots-clés et optimisation ad copy rigoureuse.",
    caveatEn: "Highest CPM and CPC of the portfolio on competitive keywords. Requires rigorous keyword research and ad copy optimization.",
    idealUsageFr: "Pour capturer les recherches à haut intent en phase de décision",
    idealUsageEn: "To capture high-intent searches in decision stage",
    adFormatsFr: ['Search Ads', 'Performance Max', 'Dynamic Search Ads', 'Shopping Ads'],
    adFormatsEn: ['Search Ads', 'Performance Max', 'Dynamic Search Ads', 'Shopping Ads'],
    pricePositionFr: 'Prix élevé sur mots-clés compétitifs, bas sur long tail',
    pricePositionEn: 'High pricing on competitive keywords, low on long tail'
  }
};

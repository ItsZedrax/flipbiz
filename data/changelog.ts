export type ChangelogItemType = "new" | "improvement" | "fix";

export type ChangelogItem = {
  type: ChangelogItemType;
  text: string;
};

export type ChangelogEntry = {
  /** Semantic version, used as the localStorage key. Bump it for every shipped release. */
  version: string;
  /** Release date in ISO format (YYYY-MM-DD). */
  date: string;
  /** Short title shown in the timeline header. */
  title: string;
  items: ChangelogItem[];
};

/**
 * Add the newest release at the top. Bump the `version` of the latest entry
 * each time you ship something user-visible — the badge will reappear for
 * everyone.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.8.0",
    date: "2026-05-06",
    title: "Objectifs, heatmap, bulk actions, drafts, audit",
    items: [
      {
        type: "new",
        text: "Carte « Objectif du mois » sur le tableau de bord avec barre de progression colorée — tu vois ta progression vers ton objectif de profit en temps réel. Définis-le depuis Mon profil.",
      },
      {
        type: "new",
        text: "Heatmap annuelle sur Analytics : 365 cases (style GitHub) qui montrent ton profit jour par jour. Survole pour voir le détail.",
      },
      {
        type: "new",
        text: "Sélection multiple sur la liste Articles (vue table) : coche plusieurs articles → barre flottante pour changer le statut ou supprimer en masse.",
      },
      {
        type: "new",
        text: "Auto-save des brouillons sur les formulaires Article et Dépense : si tu refresh ou perds la page, ton travail est restauré automatiquement à ton retour.",
      },
      {
        type: "new",
        text: "Onglet « Activité » dans /admin : timeline des 200 dernières actions (création, modification, suppression) avec qui a fait quoi et quand.",
      },
    ],
  },
  {
    version: "0.7.4",
    date: "2026-05-05",
    title: "Fiche article qui tient sur l'écran",
    items: [
      {
        type: "fix",
        text: "Le détail d'un article ne déborde plus à droite sur mobile : la timeline (achat / vente) et le détail financier s'affichent en entier. Les boutons « Modifier » / « Supprimer » se compactent en icônes sur les petits écrans.",
      },
    ],
  },
  {
    version: "0.7.3",
    date: "2026-05-05",
    title: "Verrou largeur + nav mobile peaufinée",
    items: [
      {
        type: "fix",
        text: "Toutes les pages ont désormais la même largeur exacte sur mobile : plus aucun décalage horizontal possible, gestes de slide bloqués au niveau racine.",
      },
      {
        type: "improvement",
        text: "Bouton flottant retiré du tableau de bord et du stock — il n'apparaît plus que sur Articles, Achats, Ventes et Dépenses.",
      },
      {
        type: "improvement",
        text: "Nouvelle bottom nav mobile : Tableau de bord · Articles · Achats · Ventes · Paramètres (Stock, Analytics et Dépenses restent dans la palette ⌘K et la sidebar desktop).",
      },
    ],
  },
  {
    version: "0.7.2",
    date: "2026-05-05",
    title: "Mobile : moins de doublons, nav plus pertinente",
    items: [
      {
        type: "fix",
        text: "Plus de bouton « + Article / + Vente / + Dépense » dupliqué sur mobile : le bouton flottant suffit (ces boutons restent visibles sur desktop).",
      },
      {
        type: "improvement",
        text: "Bottom nav réorganisée : Tableau de bord · Articles · Ventes · Achats · Analytics. Stock, Dépenses et Paramètres restent accessibles via le menu et la sidebar desktop.",
      },
    ],
  },
  {
    version: "0.7.1",
    date: "2026-05-05",
    title: "Recadrage de la photo de profil",
    items: [
      {
        type: "improvement",
        text: "Quand tu ajoutes une photo de profil, une fenêtre te permet de la recadrer en carré (déplacer + zoomer) avant l'upload — fini les visages écrasés.",
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-05-04",
    title: "Power user desktop",
    items: [
      {
        type: "new",
        text: "Recherche rapide ⌘K (ou Ctrl+K) : tape pour aller à n'importe quelle page, créer un article / une vente / un achat / une dépense, ou basculer le thème — sans toucher la souris.",
      },
      {
        type: "new",
        text: "Sidebar repliable : flèche en bord de sidebar pour la réduire en mode icônes seulement et gagner de l'espace. Préférence sauvegardée d'une session à l'autre.",
      },
      {
        type: "new",
        text: "Clic-droit sur une carte ou une ligne d'article : menu contextuel avec Ouvrir, Modifier, Vendre, Copier le lien, Supprimer.",
      },
      {
        type: "new",
        text: "Tri par clic sur les en-têtes de colonnes Article, Coût et Profit dans la liste articles. Re-clique pour inverser asc / desc.",
      },
      {
        type: "improvement",
        text: "Filtres Articles persistants entre sessions : tu retrouves automatiquement tes derniers filtres / tri / vue à ton retour.",
      },
    ],
  },
  {
    version: "0.6.1",
    date: "2026-05-04",
    title: "Photo de profil",
    items: [
      {
        type: "new",
        text: "Ajoute une vraie photo de profil depuis Mon profil — elle remplace tes initiales colorées dans le menu, à côté des ventes et partout où ton avatar apparaît.",
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-05-04",
    title: "Navigation premium",
    items: [
      {
        type: "fix",
        text: "Le haut de l'app n'est plus rogné sur desktop (régression de la dernière version).",
      },
      {
        type: "new",
        text: "Bouton + flottant sur mobile, contextuel : affiche « + Article » sur Articles, « + Vente » sur Ventes, « + Achat » sur Achats, « + Dépense » sur Dépenses.",
      },
      {
        type: "new",
        text: "Fil d'Ariane (« Articles › Air Jordan 1 ») sur les pages de détail et les formulaires : un clic pour remonter d'un cran.",
      },
      {
        type: "new",
        text: "Le header se cache automatiquement au scroll vers le bas et réapparaît quand tu scrolles vers le haut — comme dans Safari ou Twitter.",
      },
      {
        type: "improvement",
        text: "Bottom nav : indicateur en gradient violet → rose qui glisse entre les onglets actifs, l'icône grossit légèrement à l'arrivée.",
      },
    ],
  },
  {
    version: "0.5.3",
    date: "2026-05-04",
    title: "Layout mobile + toasts + scrollbar",
    items: [
      {
        type: "fix",
        text: "Plus de défilement horizontal parasite : les tables analytics adaptent leurs colonnes à la largeur de l'écran.",
      },
      {
        type: "improvement",
        text: "Toasts plus riches : couleurs sémantiques (succès vert, erreur rouge), icônes adaptées, bouton de fermeture, jusqu'à 4 visibles.",
      },
      {
        type: "improvement",
        text: "Scrollbar fine qui se teinte d'un dégradé violet → rose au survol.",
      },
      {
        type: "improvement",
        text: "Bascule clair / sombre étendue à plus de surfaces (sidebar, header, cards, inputs) pour un cross-fade homogène en 200ms.",
      },
    ],
  },
  {
    version: "0.5.2",
    date: "2026-05-04",
    title: "Correctif tableau de bord",
    items: [
      {
        type: "fix",
        text: "Le tableau de bord affichait une erreur en production à cause d'un format de chiffres incompatible — c'est réparé.",
      },
    ],
  },
  {
    version: "0.5.1",
    date: "2026-05-04",
    title: "Pull-to-refresh sur mobile",
    items: [
      {
        type: "new",
        text: "Tire la page vers le bas depuis n'importe quelle vue mobile pour rafraîchir les données — comme dans tes apps natives préférées.",
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-04",
    title: "Dashboard vivant + lightbox photos",
    items: [
      {
        type: "new",
        text: "Les chiffres du tableau de bord s'animent à l'arrivée — un compteur fluide de 0 jusqu'à la valeur finale.",
      },
      {
        type: "new",
        text: "Comparaison vs mois précédent sur le CA, le profit et le nombre de ventes (flèche ↑↓ et %).",
      },
      {
        type: "new",
        text: "Clique sur une photo d'article pour l'agrandir en plein écran. Swipe pour naviguer entre les photos sur mobile.",
      },
      {
        type: "improvement",
        text: "Couleurs distinctives par catégorie : sneakers en orange, cartes en ambre, montres en bleu.",
      },
      {
        type: "improvement",
        text: "Effet hover premium sur les cartes : léger soulèvement et ombre colorée.",
      },
      {
        type: "improvement",
        text: "Scrollbar fine au design discret, qui se teinte en violet au survol.",
      },
      {
        type: "improvement",
        text: "Bascule clair / sombre avec transition fluide (plus de flash brutal).",
      },
    ],
  },
  {
    version: "0.4.2",
    date: "2026-05-04",
    title: "Splash screen iOS",
    items: [
      {
        type: "new",
        text: "Au lancement de la PWA sur iPhone, un écran d'ouverture sur-mesure s'affiche : logo FlipBiz centré sur le gradient violet → rose.",
      },
    ],
  },
  {
    version: "0.4.1",
    date: "2026-05-04",
    title: "Petits raffinements",
    items: [
      {
        type: "fix",
        text: "La version affichée en bas de la sidebar reflète maintenant la version réelle de l'app.",
      },
      {
        type: "improvement",
        text: "Clique sur la version en bas de la sidebar pour ouvrir « Quoi de neuf ».",
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-04",
    title: "Polish visuel",
    items: [
      { type: "new", text: "Page « Quoi de neuf » accessible depuis ton menu." },
      {
        type: "improvement",
        text: "Tableau de bord avec une carte « Profit du mois » en gradient violet → rose.",
      },
      {
        type: "improvement",
        text: "Header, sidebar et bottom nav en effet verre dépoli.",
      },
      {
        type: "improvement",
        text: "Transitions fluides entre les pages (fade + slide).",
      },
      {
        type: "improvement",
        text: "Skeletons de chargement adaptés à chaque section.",
      },
      {
        type: "improvement",
        text: "Photos d'articles avec animation shimmer pendant le chargement.",
      },
      {
        type: "new",
        text: "Confettis et toast spécial à ta toute première vente 🎉",
      },
      {
        type: "improvement",
        text: "Empty states illustrés avec icône en gradient et CTA.",
      },
      {
        type: "improvement",
        text: "Mode sombre amélioré avec dégradés de fond subtils.",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-03",
    title: "Panneau d'administration",
    items: [
      {
        type: "new",
        text: "Onglet Admin avec gestion des utilisateurs (approuver, promouvoir, supprimer).",
      },
      {
        type: "new",
        text: "Système d'approbation : les nouveaux comptes attendent ton OK avant d'accéder à l'app.",
      },
      {
        type: "new",
        text: "Bannières d'annonce globales (info, avertissement, critique).",
      },
      { type: "new", text: "Stats globales : utilisateurs, activité, CA cumulé, storage." },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-02",
    title: "PWA installable + correctifs iPhone",
    items: [
      {
        type: "new",
        text: "FlipBiz est désormais installable en PWA (iOS, Android, desktop).",
      },
      {
        type: "fix",
        text: "Le header ne se confond plus avec la barre status iOS.",
      },
      {
        type: "fix",
        text: "Les titres des cartes KPI ne sont plus tronqués sur mobile.",
      },
      {
        type: "improvement",
        text: "Page 404 sur-mesure et erreurs gérées proprement.",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-04-30",
    title: "Première version",
    items: [
      {
        type: "new",
        text: "Tableau de bord, articles, achats, ventes, dépenses, analytics, export Excel/PDF.",
      },
      { type: "new", text: "Authentification, multi-utilisateurs et thème clair / sombre." },
    ],
  },
];

/** The version that determines the unread badge state. */
export const LATEST_VERSION = CHANGELOG[0].version;

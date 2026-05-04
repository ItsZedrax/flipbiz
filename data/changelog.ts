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

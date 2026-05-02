import type { Enums } from "@/types/database";

export const APP_NAME = "FlipBiz";

export const AVATAR_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
] as const;

export const CATEGORY_LABELS: Record<Enums<"article_category">, string> = {
  sneakers: "Sneakers",
  cards: "Cartes",
  watches: "Montres",
  other: "Autre",
};

export const CONDITION_LABELS: Record<Enums<"article_condition">, string> = {
  new_unworn: "Neuf jamais porté",
  new_with_tags: "Neuf étiqueté",
  very_good: "Très bon état",
  good: "Bon état",
  fair: "État correct",
  poor: "Mauvais état",
};

export const STATUS_LABELS: Record<Enums<"article_status">, string> = {
  in_stock: "En stock",
  reserved: "Réservé",
  sold: "Vendu",
  returned: "Retourné",
};

export const STATUS_COLORS: Record<Enums<"article_status">, string> = {
  in_stock: "bg-success/15 text-success border-success/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
  sold: "bg-muted text-muted-foreground border-border",
  returned: "bg-destructive/15 text-destructive border-destructive/30",
};

export const DEFAULT_PLATFORMS = [
  "Vinted",
  "eBay",
  "Leboncoin",
  "StockX",
  "GOAT",
  "Wethenew",
  "Vestiaire Collective",
  "Chrono24",
  "Catawiki",
  "Physique",
  "Autre",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Emballage",
  "Authentification",
  "Transport",
  "Abonnement",
  "Outils",
  "Marketing",
  "Frais bancaires",
  "Autre",
];

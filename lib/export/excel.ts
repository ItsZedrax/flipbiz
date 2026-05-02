import * as XLSX from "xlsx";
import type { ExportData } from "@/lib/export/fetch-data";

const CATEGORY_LABELS: Record<string, string> = {
  sneakers: "Sneakers",
  cards: "Cartes",
  watches: "Montres",
  other: "Autre",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "En stock",
  reserved: "Réservé",
  sold: "Vendu",
  returned: "Retourné",
};

function num(v: number | string | null | undefined): number {
  return v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;
}

export function downloadExcel(data: ExportData) {
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: Summary =====
  const totalRevenue = data.articles.reduce(
    (acc, a) => acc + (a.net_revenue ?? 0),
    0,
  );
  const totalProfit = data.articles.reduce(
    (acc, a) => acc + (a.net_profit ?? 0),
    0,
  );
  const totalCost = data.articles.reduce((acc, a) => acc + a.total_cost, 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + num(e.amount), 0);
  const inStockCount = data.articles.filter((a) => a.status === "in_stock").length;
  const soldCount = data.articles.filter((a) => a.status === "sold").length;

  const summary = [
    ["FlipBiz — Export"],
    ["Période", data.periodLabel],
    ["Du", data.from ?? "—"],
    ["Au", data.to],
    [""],
    ["Articles inclus", data.articles.length],
    ["  En stock", inStockCount],
    ["  Vendus", soldCount],
    ["Coût total", totalCost],
    ["Chiffre d'affaires net", totalRevenue],
    ["Profit net (articles)", totalProfit],
    ["Dépenses business", totalExpenses],
    ["Profit net (après dépenses)", totalProfit - totalExpenses],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summary);
  ws1["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Sommaire");

  // ===== Sheet 2: Articles =====
  const articlesRows = data.articles.map((a) => ({
    Nom: a.name,
    Catégorie: CATEGORY_LABELS[a.category] ?? a.category,
    Marque: a.brand ?? "",
    Référence: a.reference ?? "",
    Taille: a.size ?? "",
    Coloris: a.colorway ?? "",
    "État": a.condition,
    Statut: STATUS_LABELS[a.status] ?? a.status,
    "Acheté par": a.buyer?.full_name ?? a.buyer?.username ?? "",
    "Date achat": a.purchase?.purchase_date ?? "",
    "Coût total (€)": a.total_cost,
    "Vendu par": a.seller?.full_name ?? a.seller?.username ?? "",
    "Date vente": a.sale?.sale_date ?? "",
    "Prix vente (€)": a.sale ? num(a.sale.sale_price) : "",
    "Net encaissé (€)": a.net_revenue ?? "",
    "Profit net (€)": a.net_profit ?? "",
    "ROI %": a.roi_pct ?? "",
    Tags: a.tags.join(", "),
  }));
  const ws2 = XLSX.utils.json_to_sheet(articlesRows);
  ws2["!cols"] = [
    { wch: 36 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 8 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Articles");

  // ===== Sheet 3: Purchases =====
  const purchasesRows = data.articles
    .filter((a) => a.purchase)
    .map((a) => {
      const p = a.purchase!;
      const fees =
        num(p.shipping_cost_in) +
        num(p.packaging_cost) +
        num(p.authentication_cost) +
        num(p.other_costs);
      return {
        Date: p.purchase_date,
        Article: a.name,
        Catégorie: CATEGORY_LABELS[a.category] ?? a.category,
        "Acheté par": a.buyer?.full_name ?? a.buyer?.username ?? "",
        Plateforme: p.purchase_platform ?? "",
        Vendeur: p.seller_name ?? "",
        "Prix (€)": num(p.purchase_price),
        "Livraison (€)": num(p.shipping_cost_in),
        "Emballage (€)": num(p.packaging_cost),
        "Auth (€)": num(p.authentication_cost),
        "Autres frais (€)": num(p.other_costs),
        "Total frais (€)": fees,
        "Coût total (€)": num(p.purchase_price) + fees,
        Notes: p.notes ?? "",
      };
    });
  const ws3 = XLSX.utils.json_to_sheet(purchasesRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Achats");

  // ===== Sheet 4: Sales =====
  const salesRows = data.articles
    .filter((a) => a.sale)
    .map((a) => {
      const s = a.sale!;
      return {
        Date: s.sale_date,
        Article: a.name,
        Catégorie: CATEGORY_LABELS[a.category] ?? a.category,
        "Vendu par": a.seller?.full_name ?? a.seller?.username ?? "",
        Plateforme: s.sale_platform ?? "",
        Acheteur: s.buyer_name ?? "",
        "Prix vente (€)": num(s.sale_price),
        "Livraison (€)": num(s.shipping_cost_out),
        "Commission %": num(s.platform_fees_pct),
        "Commission (€)": num(s.platform_fees_amount),
        "Autres frais (€)": num(s.other_fees),
        "Net encaissé (€)": a.net_revenue ?? 0,
        "Coût total (€)": a.total_cost,
        "Profit (€)": a.net_profit ?? 0,
        "ROI %": a.roi_pct ?? 0,
        Paiement: s.payment_method ?? "",
        Tracking: s.tracking_number ?? "",
        Notes: s.notes ?? "",
      };
    });
  const ws4 = XLSX.utils.json_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, ws4, "Ventes");

  // ===== Sheet 5: Expenses =====
  const expensesRows = data.expenses.map((e) => ({
    Date: e.date,
    Description: e.description,
    Catégorie: e.category,
    "Engagée par": e.user?.full_name ?? e.user?.username ?? "",
    "Montant (€)": num(e.amount),
  }));
  const ws5 = XLSX.utils.json_to_sheet(expensesRows);
  XLSX.utils.book_append_sheet(wb, ws5, "Dépenses");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `flipbiz-export-${today}.xlsx`);
}

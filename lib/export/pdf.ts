import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExportData } from "@/lib/export/fetch-data";

const CATEGORY_LABELS: Record<string, string> = {
  sneakers: "Sneakers",
  cards: "Cartes",
  watches: "Montres",
  other: "Autre",
};

function num(v: number | string | null | undefined): number {
  return v == null ? 0 : typeof v === "string" ? parseFloat(v) : v;
}

function fmt(v: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(v);
}

export function downloadPdf(data: ExportData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== Header =====
  doc.setFillColor(99, 102, 241); // primary indigo
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FlipBiz", 40, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Rapport business", 40, 52);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(
    `Période : ${data.periodLabel}`,
    pageWidth - 40,
    36,
    { align: "right" },
  );
  doc.text(
    `${data.from ?? "—"} → ${data.to}`,
    pageWidth - 40,
    50,
    { align: "right" },
  );

  // ===== KPIs =====
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
  const soldCount = data.articles.filter((a) => a.status === "sold").length;
  const inStockCount = data.articles.filter(
    (a) => a.status === "in_stock",
  ).length;

  doc.setTextColor(20, 20, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Indicateurs clés", 40, 90);

  autoTable(doc, {
    startY: 100,
    theme: "plain",
    head: [],
    body: [
      ["Articles inclus", String(data.articles.length)],
      ["  En stock", String(inStockCount)],
      ["  Vendus", String(soldCount)],
      ["Coût total", `${fmt(totalCost)} €`],
      ["Chiffre d'affaires net", `${fmt(totalRevenue)} €`],
      ["Profit net (articles)", `${fmt(totalProfit)} €`],
      ["Dépenses business", `${fmt(totalExpenses)} €`],
      [
        { content: "Profit net après dépenses", styles: { fontStyle: "bold" } },
        { content: `${fmt(totalProfit - totalExpenses)} €`, styles: { fontStyle: "bold" } },
      ],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { cellWidth: 220 }, 1: { halign: "right" } },
  });

  // ===== Performance per user =====
  const userMap = new Map<
    string,
    { name: string; bought: number; sold: number; profit: number }
  >();
  for (const p of data.profiles) {
    userMap.set(p.id, {
      name: p.full_name ?? p.username,
      bought: 0,
      sold: 0,
      profit: 0,
    });
  }
  for (const a of data.articles) {
    if (a.purchase && userMap.has(a.purchase.buyer_id)) {
      userMap.get(a.purchase.buyer_id)!.bought++;
    }
    if (a.sale && userMap.has(a.sale.seller_id)) {
      const slot = userMap.get(a.sale.seller_id)!;
      slot.sold++;
      slot.profit += a.net_profit ?? 0;
    }
  }
  const userRows = Array.from(userMap.values())
    .sort((a, b) => b.profit - a.profit)
    .map((u) => [
      u.name,
      String(u.bought),
      String(u.sold),
      `${fmt(u.profit)} €`,
    ]);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = ((doc as any).lastAutoTable?.finalY ?? 200) + 25;
  doc.text("Performance par associé", 40, lastY);
  autoTable(doc, {
    startY: lastY + 10,
    head: [["Associé", "Achetés", "Vendus", "Profit"]],
    body: userRows,
    headStyles: { fillColor: [243, 244, 246], textColor: 30 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  // ===== Top sales =====
  const topSales = data.articles
    .filter((a) => a.net_profit != null)
    .sort((a, b) => (b.net_profit ?? 0) - (a.net_profit ?? 0))
    .slice(0, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY2 = ((doc as any).lastAutoTable?.finalY ?? 300) + 25;
  if (topSales.length > 0) {
    if (lastY2 > 700) doc.addPage();
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Top 10 ventes (par profit)",
      40,
      lastY2 > 700 ? 50 : lastY2,
    );
    autoTable(doc, {
      startY: (lastY2 > 700 ? 50 : lastY2) + 10,
      head: [["Article", "Catégorie", "Coût", "Vente", "Profit", "ROI"]],
      body: topSales.map((a) => [
        a.name.length > 40 ? a.name.slice(0, 38) + "…" : a.name,
        CATEGORY_LABELS[a.category] ?? a.category,
        `${fmt(a.total_cost)} €`,
        a.sale ? `${fmt(num(a.sale.sale_price))} €` : "—",
        `${fmt(a.net_profit ?? 0)} €`,
        a.roi_pct != null ? `${a.roi_pct.toFixed(0)}%` : "—",
      ]),
      headStyles: { fillColor: [243, 244, 246], textColor: 30 },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });
  }

  // ===== Expenses by category =====
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY3 = ((doc as any).lastAutoTable?.finalY ?? 500) + 25;
  if (data.expenses.length > 0) {
    if (lastY3 > 700) doc.addPage();
    const expByCat = new Map<string, number>();
    for (const e of data.expenses) {
      expByCat.set(e.category, (expByCat.get(e.category) ?? 0) + num(e.amount));
    }
    const expRows = Array.from(expByCat.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => [cat, `${fmt(total)} €`]);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Dépenses par catégorie",
      40,
      lastY3 > 700 ? 50 : lastY3,
    );
    autoTable(doc, {
      startY: (lastY3 > 700 ? 50 : lastY3) + 10,
      head: [["Catégorie", "Total"]],
      body: expRows,
      headStyles: { fillColor: [243, 244, 246], textColor: 30 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 1: { halign: "right", cellWidth: 120 } },
    });
  }

  // ===== Footer on every page =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `FlipBiz — généré le ${new Date().toLocaleDateString("fr-FR")} · page ${i}/${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`flipbiz-rapport-${today}.pdf`);
}

"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchExportData,
  type ExportPeriod,
} from "@/lib/export/fetch-data";

const PERIOD_OPTIONS: Array<{ value: ExportPeriod; label: string }> = [
  { value: "30d", label: "30 derniers jours" },
  { value: "3m", label: "3 derniers mois" },
  { value: "6m", label: "6 derniers mois" },
  { value: "12m", label: "12 derniers mois" },
  { value: "all", label: "Tout" },
];

export function ExportControls() {
  const [period, setPeriod] = useState<ExportPeriod>("12m");
  const [pending, setPending] = useState<"xlsx" | "pdf" | null>(null);

  async function exportFile(kind: "xlsx" | "pdf") {
    setPending(kind);
    try {
      const data = await fetchExportData(period);
      if (data.articles.length === 0 && data.expenses.length === 0) {
        toast.error("Aucune donnée sur cette période.");
        setPending(null);
        return;
      }
      if (kind === "xlsx") {
        const { downloadExcel } = await import("@/lib/export/excel");
        downloadExcel(data);
      } else {
        const { downloadPdf } = await import("@/lib/export/pdf");
        downloadPdf(data);
      }
      toast.success(`Export ${kind.toUpperCase()} prêt`);
    } catch (e) {
      toast.error("Export échoué", {
        description: e instanceof Error ? e.message : "Erreur inconnue",
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Période</CardTitle>
          <CardDescription>
            Toutes les données dont la date d&apos;achat ou de vente tombe dans
            cette fenêtre seront incluses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 rounded-md border bg-card p-1">
            {PERIOD_OPTIONS.map((o) => {
              const active = period === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setPeriod(o.value)}
                  disabled={pending !== null}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-success" />
              Excel
            </CardTitle>
            <CardDescription>
              5 feuilles : Sommaire, Articles, Achats, Ventes, Dépenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportFile("xlsx")}
              disabled={pending !== null}
              className="w-full"
            >
              {pending === "xlsx" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FileSpreadsheet />
              )}
              Télécharger .xlsx
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-destructive" />
              PDF
            </CardTitle>
            <CardDescription>
              Rapport synthétique : KPIs, perf par associé, top ventes, dépenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportFile("pdf")}
              disabled={pending !== null}
              className="w-full"
            >
              {pending === "pdf" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FileText />
              )}
              Télécharger .pdf
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

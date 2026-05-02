import type { Metadata } from "next";
import { ExportControls } from "@/components/export/export-controls";

export const metadata: Metadata = { title: "Export" };

export default function ExportPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Export</h1>
        <p className="text-sm text-muted-foreground">
          Télécharge tes données pour comptabilité, archivage ou analyse externe.
        </p>
      </div>
      <ExportControls />
    </div>
  );
}

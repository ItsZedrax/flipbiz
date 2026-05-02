"use client";

import * as React from "react";
import { Upload, FileText, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

type InvoiceUploaderProps = {
  /** Currently stored URL (signed, can be empty). */
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  scope?: string;
  disabled?: boolean;
};

export function InvoiceUploader({
  value,
  onChange,
  userId,
  scope = "tmp",
  disabled = false,
}: InvoiceUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled) return;
    const file = files[0]!;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Type non supporté (PDF, JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Fichier trop lourd (max 10 Mo).");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const safeExt = ext.length <= 4 ? ext : "pdf";
    const path = `${scope}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const { error: upErr } = await supabase.storage
      .from("invoices")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) {
      toast.error(`Upload échoué : ${upErr.message}`);
      setUploading(false);
      return;
    }

    // Long-lived signed URL (1 year). The bucket is private so we sign.
    const { data: signed, error: signErr } = await supabase.storage
      .from("invoices")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signErr || !signed?.signedUrl) {
      toast.error(`URL signée impossible : ${signErr?.message ?? "—"}`);
      setUploading(false);
      return;
    }

    onChange(signed.signedUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Facture ajoutée.");
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-card p-3">
        <FileText className="h-5 w-5 text-primary" />
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="flex-1 truncate text-sm font-medium text-primary hover:underline"
        >
          Voir la facture
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </a>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label="Retirer la facture"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
      )}
      role="button"
      tabIndex={0}
    >
      {uploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <Upload className="h-5 w-5 text-muted-foreground" />
      )}
      <div>
        <p className="text-sm font-medium">
          {uploading ? "Upload en cours…" : "Importer la facture"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF / JPG / PNG · max 10 Mo
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || uploading}
      />
    </div>
  );
}

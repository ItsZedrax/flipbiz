"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

type PhotoUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  userId: string;
  /** Optional. If provided, files are saved under this folder. Otherwise: tmp/. */
  articleId?: string;
  max?: number;
  disabled?: boolean;
};

export function PhotoUploader({
  value,
  onChange,
  userId,
  articleId,
  max = 10,
  disabled = false,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const folder = articleId ?? `tmp/${userId}`;

  async function uploadFiles(files: FileList | File[]) {
    if (disabled) return;

    const filesArr = Array.from(files);
    const slotsLeft = max - value.length;
    if (slotsLeft <= 0) {
      toast.error(`Maximum ${max} photos atteint.`);
      return;
    }
    if (filesArr.length > slotsLeft) {
      toast.error(`Tu peux ajouter ${slotsLeft} photo${slotsLeft > 1 ? "s" : ""} de plus.`);
      return;
    }

    // Validate
    for (const f of filesArr) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`${f.name} : type non supporté (JPEG/PNG/WebP/HEIC seulement).`);
        return;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} : trop lourd (max 5 Mo).`);
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    for (const file of filesArr) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safeExt = ext.length <= 4 ? ext : "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

      const { error } = await supabase.storage
        .from("article-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        toast.error(`Upload échoué : ${error.message}`);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("article-photos")
        .getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast.success(`${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} ajoutée${newUrls.length > 1 ? "s" : ""}.`);
  }

  function removePhoto(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50 hover:bg-muted/40",
          disabled && "pointer-events-none opacity-50",
        )}
        role="button"
        tabIndex={0}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {uploading
              ? "Upload en cours…"
              : dragActive
                ? "Lâche ici"
                : "Glisse tes photos ici"}
          </p>
          <p className="text-xs text-muted-foreground">
            ou clique pour parcourir · JPG/PNG/WebP · max 5 Mo · jusqu&apos;à {max}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
          }}
          disabled={disabled || uploading}
        />
      </div>

      {/* Previews */}
      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.map((url, idx) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <Image
                src={url}
                alt={`Photo ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
                unoptimized
              />
              {idx === 0 ? (
                <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Principale
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                aria-label="Supprimer la photo"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {value.length < max ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-input text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              disabled={disabled || uploading}
              aria-label="Ajouter une photo"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ACCEPT = "image/png,image/jpeg,image/webp";

type Props = {
  userId: string;
  username: string;
  fullName: string | null;
  color: string;
  avatarUrl: string | null;
};

export function AvatarUploader({
  userId,
  username,
  fullName,
  color,
  avatarUrl,
}: Props) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  // Optimistic preview while uploading.
  const [preview, setPreview] = React.useState<string | null>(null);

  const displayedUrl = preview ?? avatarUrl;

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", {
        description: "Choisis un PNG, JPEG ou WebP.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Fichier trop lourd", { description: "4 Mo maximum." });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setPending(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
      if (updateErr) throw updateErr;

      // Best-effort: clean up older avatar files for this user.
      try {
        const { data: list } = await supabase.storage
          .from("avatars")
          .list(userId);
        const stale = (list ?? [])
          .filter((f) => `${userId}/${f.name}` !== path)
          .map((f) => `${userId}/${f.name}`);
        if (stale.length) await supabase.storage.from("avatars").remove(stale);
      } catch {
        /* non-blocking */
      }

      toast.success("Photo de profil mise à jour");
      setPreview(null);
      router.refresh();
    } catch (err) {
      toast.error("Upload impossible", {
        description: err instanceof Error ? err.message : "Réessaie.",
      });
      setPreview(null);
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    if (!avatarUrl) return;
    setPending(true);
    const supabase = createClient();
    try {
      // Remove every avatar file in this user's folder.
      const { data: list } = await supabase.storage
        .from("avatars")
        .list(userId);
      if (list?.length) {
        await supabase.storage
          .from("avatars")
          .remove(list.map((f) => `${userId}/${f.name}`));
      }
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Photo retirée");
      router.refresh();
    } catch (err) {
      toast.error("Suppression impossible", {
        description: err instanceof Error ? err.message : "Réessaie.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar
          fullName={fullName}
          username={username}
          avatarUrl={displayedUrl}
          color={color}
          className="h-20 w-20 text-xl"
        />
        {pending ? (
          <div className="absolute inset-0 grid place-items-center rounded-full bg-black/50 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleSelect}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera />
            {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Retirer
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          PNG, JPEG ou WebP · 4 Mo max
        </p>
      </div>
    </div>
  );
}

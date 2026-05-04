"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Maximize2 } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { PhotoLightbox } from "@/components/articles/photo-lightbox";
import { cn } from "@/lib/utils";

export function PhotoGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [selected, setSelected] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const main = photos[selected];

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="Agrandir la photo"
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {main ? (
          <SmartImage
            src={main}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
            unoptimized
          />
        ) : null}
        <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                i === selected
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Photo ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
      <PhotoLightbox
        photos={photos}
        initialIndex={selected}
        alt={alt}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}

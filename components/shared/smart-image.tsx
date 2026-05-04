"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SmartImageProps = Omit<ImageProps, "onLoad" | "onError"> & {
  containerClassName?: string;
};

/**
 * Wraps next/image with a shimmer placeholder that fades out once the
 * image is loaded. Works for arbitrary remote URLs (e.g. Supabase storage)
 * without needing a precomputed blurDataURL.
 */
export function SmartImage({
  className,
  containerClassName,
  alt,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", containerClassName)}>
      {/* Shimmer placeholder, visible until image loads */}
      {!loaded && !errored ? (
        <div
          className="img-shimmer absolute inset-0"
          aria-hidden
        />
      ) : null}
      <Image
        alt={alt}
        {...props}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

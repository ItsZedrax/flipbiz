"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 animate-fade-in">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Quelque chose s&apos;est mal passé
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {error.message || "Une erreur inattendue est survenue lors du chargement de cette page."}
            </p>
            {error.digest ? (
              <p className="text-xs text-muted-foreground">
                Code : <code className="font-mono">{error.digest}</code>
              </p>
            ) : null}
          </div>
          <Button onClick={reset} variant="outline">
            <RotateCw />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary/5 via-background to-accent/30 px-4">
      <Card className="w-full max-w-md animate-slide-up shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">404</h1>
            <p className="text-sm text-muted-foreground">
              Cette page n&apos;existe pas ou a été déplacée.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Retour au tableau de bord</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

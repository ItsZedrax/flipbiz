import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ComingSoonProps = {
  title: string;
  description?: string;
  stage: number;
};

export function ComingSoon({ title, description, stage }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1 text-muted-foreground">{description}</p>
      ) : null}
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-warning/10 text-warning">
            <Construction className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">À venir dans l&apos;étape {stage}</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Cette section sera construite prochainement. Le squelette est en
            place pour la navigation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

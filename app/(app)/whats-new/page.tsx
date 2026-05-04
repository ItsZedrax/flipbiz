import { Sparkles } from "lucide-react";
import { CHANGELOG } from "@/data/changelog";
import { ChangelogTimeline } from "@/components/whats-new/changelog-timeline";
import { MarkAsRead } from "@/components/whats-new/mark-as-read";

export const metadata = { title: "Quoi de neuf" };

export default function WhatsNewPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <MarkAsRead />
      <div className="flex items-center gap-3">
        <div className="bg-hero-gradient grid h-12 w-12 place-items-center rounded-xl text-white shadow-md shadow-primary/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quoi de neuf</h1>
          <p className="text-sm text-muted-foreground">
            Toutes les évolutions de FlipBiz, de la plus récente à la première.
          </p>
        </div>
      </div>
      <ChangelogTimeline entries={CHANGELOG} />
    </div>
  );
}

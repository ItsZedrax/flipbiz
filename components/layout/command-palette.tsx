"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Sparkles,
  Sun,
  Moon,
  Search as SearchIcon,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/nav-items";

const QUICK_ACTIONS: Array<{
  label: string;
  href: string;
  icon: typeof Plus;
  keywords?: string;
}> = [
  { label: "Nouvel article", href: "/articles/new", icon: Plus, keywords: "ajouter créer add" },
  { label: "Nouvelle vente", href: "/sales/new", icon: Plus, keywords: "vendre add" },
  { label: "Nouvel achat", href: "/purchases/new", icon: Plus, keywords: "acheter add" },
  { label: "Nouvelle dépense", href: "/expenses/new", icon: Plus, keywords: "frais add" },
];

export function CommandPalette({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Recherche rapide</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Tape pour rechercher ou exécuter une action…" />
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>

            <CommandGroup heading="Actions rapides">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <CommandItem
                    key={a.href}
                    value={`${a.label} ${a.keywords ?? ""}`}
                    onSelect={() => go(a.href)}
                  >
                    <Icon />
                    <span>{a.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandGroup heading="Aller à">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
              {isAdmin ? (
                <CommandItem
                  value="admin administration"
                  onSelect={() => go("/admin")}
                >
                  <ShieldCheck />
                  <span>Admin</span>
                </CommandItem>
              ) : null}
              <CommandItem value="profil mon compte" onSelect={() => go("/profile")}>
                <SearchIcon />
                <span>Mon profil</span>
              </CommandItem>
              <CommandItem
                value="quoi de neuf changelog updates"
                onSelect={() => go("/whats-new")}
              >
                <Sparkles />
                <span>Quoi de neuf</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Préférences">
              <CommandItem
                value="thème sombre clair dark light theme"
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
                <span>
                  Basculer en mode {theme === "dark" ? "clair" : "sombre"}
                </span>
                <CommandShortcut>⇧⌘L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const HIDE_THRESHOLD = 120; // px scrolled before auto-hide kicks in
const SCROLL_DELTA = 8; // ignore tiny jitter

type Props = {
  email: string;
  fullName: string | null;
  username: string;
  avatarUrl: string | null;
  color: string;
  hasProfile: boolean;
};

export function AppHeader({
  email,
  fullName,
  username,
  avatarUrl,
  color,
  hasProfile,
}: Props) {
  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < SCROLL_DELTA) return;

      // Always show near the top.
      if (y < HIDE_THRESHOLD) {
        setHidden(false);
      } else if (delta > 0) {
        // scrolling down → hide
        setHidden(true);
      } else {
        // scrolling up → show
        setHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "glass-strong sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] sm:px-6",
        // Mobile-only auto-hide.
        "transition-transform duration-300 will-change-transform",
        hidden ? "-translate-y-full lg:translate-y-0" : "translate-y-0",
      )}
    >
      <Link href="/" aria-label="Tableau de bord" className="lg:hidden">
        <SiteLogo />
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {hasProfile ? (
          <UserMenu
            email={email}
            fullName={fullName}
            username={username}
            avatarUrl={avatarUrl}
            color={color}
          />
        ) : null}
      </div>
    </header>
  );
}

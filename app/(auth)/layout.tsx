import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" aria-label="FlipBiz">
          <SiteLogo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </main>
    </div>
  );
}

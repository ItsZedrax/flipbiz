import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlipBiz",
    template: "%s · FlipBiz",
  },
  description:
    "Suivi d'achat-revente partagé : sneakers, cartes, montres et collection. Profit, ROI, stock et analytics en temps réel.",
  applicationName: "FlipBiz",
  appleWebApp: {
    capable: true,
    title: "FlipBiz",
    statusBarStyle: "black-translucent",
    startupImage: [
      // iPhone 15 Pro Max / 14 Pro Max
      {
        url: "/apple-splash/1290x2796",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 15 Pro / 14 Pro
      {
        url: "/apple-splash/1179x2556",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 14 Plus / 13 Pro Max / 12 Pro Max
      {
        url: "/apple-splash/1284x2778",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 14 / 13 / 13 Pro / 12 / 12 Pro
      {
        url: "/apple-splash/1170x2532",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 13 mini / 12 mini / 11 Pro / XS / X
      {
        url: "/apple-splash/1125x2436",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 11 Pro Max / XS Max
      {
        url: "/apple-splash/1242x2688",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 11 / XR
      {
        url: "/apple-splash/828x1792",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // iPhone 8 Plus / 7 Plus / 6s Plus
      {
        url: "/apple-splash/1242x2208",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      // iPhone 8 / 7 / 6s / SE 2nd & 3rd gen
      {
        url: "/apple-splash/750x1334",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // iPad Pro 12.9"
      {
        url: "/apple-splash/2048x2732",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // iPad Pro 11" / iPad Air
      {
        url: "/apple-splash/1668x2388",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      // iPad mini / iPad
      {
        url: "/apple-splash/1536x2048",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

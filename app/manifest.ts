import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FlipBiz",
    short_name: "FlipBiz",
    description:
      "Suivi d'achat-revente partagé : sneakers, cartes, montres. Profit, ROI, stock et analytics en temps réel.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0c",
    theme_color: "#6366f1",
    lang: "fr",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Articles", url: "/articles" },
      { name: "Stock", url: "/stock" },
      { name: "Analytics", url: "/analytics" },
    ],
  };
}

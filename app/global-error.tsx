"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Root error:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0a0a0c",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 16,
            }}
          >
            Oups
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Une erreur critique a interrompu l&apos;application
          </h1>
          <p style={{ color: "#a3a3a3", marginBottom: 24, fontSize: 14 }}>
            {error.message || "Erreur inconnue."}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: 0,
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}

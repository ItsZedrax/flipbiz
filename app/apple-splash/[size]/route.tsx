import { ImageResponse } from "next/og";

export const runtime = "edge";

const MAX_DIM = 4096;

/**
 * Generates an iOS PWA splash image at any size, e.g. /apple-splash/1290x2796.
 * Centered FlipBiz "F" mark on the brand gradient — matches the launch icon.
 */
export async function GET(
  _req: Request,
  ctx: { params: { size: string } },
) {
  const match = ctx.params.size.match(/^(\d+)x(\d+)$/);
  if (!match) {
    return new Response("Invalid size", { status: 400 });
  }
  const width = Math.min(parseInt(match[1], 10), MAX_DIM);
  const height = Math.min(parseInt(match[2], 10), MAX_DIM);
  if (!width || !height) {
    return new Response("Invalid size", { status: 400 });
  }

  // Logo size scales with the smallest viewport edge.
  const logoSize = Math.round(Math.min(width, height) * 0.28);
  const logoFontSize = Math.round(logoSize * 0.66);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo tile */}
        <div
          style={{
            width: logoSize,
            height: logoSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: Math.round(logoSize * 0.25),
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            fontSize: logoFontSize,
            fontWeight: 800,
            letterSpacing: "-0.05em",
          }}
        >
          F
        </div>
        {/* Wordmark */}
        <div
          style={{
            marginTop: Math.round(logoSize * 0.25),
            fontSize: Math.round(logoSize * 0.18),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "rgba(255, 255, 255, 0.95)",
          }}
        >
          FlipBiz
        </div>
      </div>
    ),
    { width, height },
  );
}

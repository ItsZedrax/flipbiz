import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          fontSize: 130,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderRadius: 38,
        }}
      >
        F
      </div>
    ),
    { ...size },
  );
}

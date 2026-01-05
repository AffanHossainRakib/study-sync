import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Study Sync - Collaborative Study Plan Manager";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            padding: "60px 80px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            The Study Sync
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#6b7280",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.4,
            }}
          >
            Collaborative Study Plan Manager & Learning Hub
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#eff6ff",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: 20,
                fontWeight: "600",
                color: "#1e40af",
              }}
            >
              📚 Study Plans
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#faf5ff",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: 20,
                fontWeight: "600",
                color: "#7c3aed",
              }}
            >
              📊 Progress Tracking
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fef3f2",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: 20,
                fontWeight: "600",
                color: "#dc2626",
              }}
            >
              🤝 Collaboration
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

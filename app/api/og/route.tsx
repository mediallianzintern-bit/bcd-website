import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0a 0%, #0d1117 50%, #0a1628 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,119,181,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,211,102,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Content wrapper */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "52px 64px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top row — FREE badge + Basecamp Digital */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                borderRadius: "50px",
                padding: "8px 24px",
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "2px",
              }}
            >
              FREE CRASH COURSE
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "#22c55e",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "white",
                }}
              >
                B
              </div>
              <span style={{ color: "#a1a1aa", fontSize: "18px", fontWeight: 600 }}>
                Basecamp Digital
              </span>
            </div>
          </div>

          {/* Center — LinkedIn icon + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* LinkedIn logo pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "#0077B5",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "38px",
                  fontWeight: 900,
                  color: "white",
                  fontFamily: "Georgia, serif",
                }}
              >
                in
              </div>
              <span
                style={{
                  color: "#0077B5",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                LinkedIn Mastery
              </span>
            </div>

            {/* Main heading */}
            <div
              style={{
                fontSize: "72px",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.1,
                letterSpacing: "-2px",
              }}
            >
              Crash Course
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "26px",
                color: "#a1a1aa",
                fontWeight: 400,
                letterSpacing: "0.5px",
              }}
            >
              Build your brand · Grow your network · Generate leads
            </div>
          </div>

          {/* Bottom row — instructor + stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                PP
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ color: "white", fontSize: "18px", fontWeight: 700 }}>
                  Pritesh Patel
                </span>
                <span style={{ color: "#71717a", fontSize: "15px" }}>
                  Ex-Meta · Ex-Yahoo · ISB Alumni
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "40px" }}>
              {[["8000+", "Students"], ["21+", "Yrs Exp"], ["100%", "Free"]].map(([val, label]) => (
                <div
                  key={label}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
                >
                  <span style={{ color: "#22c55e", fontSize: "24px", fontWeight: 800 }}>{val}</span>
                  <span style={{ color: "#71717a", fontSize: "14px" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

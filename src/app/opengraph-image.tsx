import { ImageResponse } from "next/og"

export const alt =
  "My Wall — a 2008-style Facebook wall built with React, Next.js and Supabase"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const chips = ["React 19", "Next.js 16", "Supabase Realtime", "Tailwind CSS"]

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #4e69a2 0%, #3b5998 55%, #2f477a 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#ffffff",
              color: "#3b5998",
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            f
          </div>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-1.5px",
            }}
          >
            facebook
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 82,
              fontWeight: 800,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            My Wall
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              color: "#dbe4f7",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            A 2008-style Facebook wall, rebuilt with React 19, Next.js 16 and
            Supabase Realtime.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.28)",
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontSize: 20,
                padding: "8px 18px",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}

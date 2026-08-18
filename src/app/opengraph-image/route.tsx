import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET() {
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
          background: "linear-gradient(135deg, #03050a 0%, #0a0c1d 40%, #0f0a1f 70%, #03050a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cosmic orbs */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
            top: "-150px",
            left: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(90,176,240,0.25) 0%, transparent 70%)",
            bottom: "-100px",
            right: "-50px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Star dots */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "20%",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "25%",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "30%",
            left: "15%",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "18%",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "30%",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.6)",
          }}
        />

        {/* Dog bone icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#5ab0f0" }} />
                <stop offset="50%" style={{ stopColor: "#a78bfa" }} />
                <stop offset="100%" style={{ stopColor: "#4fd1c5" }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#glow)">
              <circle cx="14" cy="20" r="8" fill="url(#boneGrad)" />
              <circle cx="14" cy="44" r="8" fill="url(#boneGrad)" />
              <rect x="14" y="26" width="36" height="12" rx="6" fill="url(#boneGrad)" />
              <circle cx="50" cy="20" r="8" fill="url(#boneGrad)" />
              <circle cx="50" cy="44" r="8" fill="url(#boneGrad)" />
              <circle cx="14" cy="20" r="3" fill="#03050a" />
              <circle cx="14" cy="44" r="3" fill="#03050a" />
              <circle cx="50" cy="20" r="3" fill="#03050a" />
              <circle cx="50" cy="44" r="3" fill="#03050a" />
            </g>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #5ab0f0 100%)",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.02em",
            textAlign: "center",
            lineHeight: 1.1,
            position: "relative",
            zIndex: 2,
          }}
        >
          Bluey&rsquo;s Commissions
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "system-ui, sans-serif",
            marginTop: "16px",
            textAlign: "center",
            letterSpacing: "0.02em",
            position: "relative",
            zIndex: 2,
          }}
        >
          VRChat Avatar Commissions
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "system-ui, sans-serif",
            marginTop: "12px",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          Handcrafted avatars built in Blender &amp; Unity
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #5ab0f0, #a78bfa, transparent)",
            borderRadius: "2px",
            zIndex: 2,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  ) as unknown as Response;
}

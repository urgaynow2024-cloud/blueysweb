import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      animation: {
        "float-slow": "floatSlow 22s ease-in-out infinite",
        "float-med": "floatMed 18s ease-in-out infinite alternate-reverse",
        "float-fast": "floatFast 14s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "gradient-pan": "gradientPan 10s ease-in-out infinite",
        "aurora-spin": "auroraSpin 26s linear infinite",
        "bob": "bob 5s ease-in-out infinite",
        "bob-delayed": "bob 6.5s ease-in-out infinite -2s",
        "marquee": "marquee 32s linear infinite",
        "sheen": "sheen 0.9s ease-out",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(18px, -26px) scale(1.04)" },
          "66%": { transform: "translate(-14px, 20px) scale(0.97)" },
        },
        floatMed: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -18px) scale(1.03)" },
          "66%": { transform: "translate(-10px, 14px) scale(0.98)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(8px, -12px) scale(1.02)" },
          "66%": { transform: "translate(-6px, 10px) scale(0.99)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        gradientPan: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        auroraSpin: {
          to: { transform: "rotate(360deg)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      transitionDuration: {
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
      },
      transitionTimingFunction: {
        "ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

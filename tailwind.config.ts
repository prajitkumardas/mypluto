import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#151515",
          900: "#1D1D1F"
        },
        canvas: "#F7F7F2",
        violet: {
          100: "#EAE6FF",
          500: "#7C63FF",
          600: "#6C4DFF"
        },
        lime: {
          100: "#F0FFD1",
          400: "#C8FF5A"
        },
        lavender: "#D8D0FF",
        coral: "#FF8269",
        sky: "#78D7FF",
        neutral: {
          50: "#F8F8F9",
          100: "#F0F1F2",
          200: "#E2E3E6",
          300: "#C9CBD0",
          500: "#777A80",
          700: "#4D4F54",
          900: "#202124"
        }
      },
      fontFamily: {
        body: ["var(--font-body)", "Inter", "Arial", "sans-serif"],
        heading: [
          "var(--font-heading)",
          "Bricolage Grotesque",
          "Inter",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 20, 20, 0.04)",
        elevated:
          "0 8px 24px rgba(20, 20, 20, 0.08), 0 2px 6px rgba(20, 20, 20, 0.04)",
        overlay:
          "0 20px 60px rgba(20, 20, 20, 0.16), 0 4px 12px rgba(20, 20, 20, 0.08)"
      },
      maxWidth: {
        site: "1280px"
      }
    }
  },
  plugins: []
};

export default config;

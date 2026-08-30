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
        canvas: "#080817",
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
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
        heading: ["var(--font-display)"]
      },
      fontSize: {
        "display-xl": ["var(--text-display-xl)", { lineHeight: "var(--leading-display-xl)", letterSpacing: "var(--tracking-display-xl)", fontWeight: "var(--font-weight-medium)" }],
        "display-lg": ["var(--text-display-lg)", { lineHeight: "var(--leading-display-lg)", letterSpacing: "var(--tracking-display-lg)", fontWeight: "var(--font-weight-medium)" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--leading-h1)", letterSpacing: "var(--tracking-h1)", fontWeight: "var(--font-weight-medium)" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--leading-h2)", letterSpacing: "var(--tracking-h2)", fontWeight: "var(--font-weight-medium)" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--leading-h3)", letterSpacing: "var(--tracking-h3)", fontWeight: "var(--font-weight-medium)" }],
        h4: ["var(--text-h4)", { lineHeight: "var(--leading-h4)", letterSpacing: "var(--tracking-h4)", fontWeight: "var(--font-weight-medium)" }],
        h5: ["var(--text-h5)", { lineHeight: "var(--leading-h5)", letterSpacing: "var(--tracking-h5)", fontWeight: "var(--font-weight-medium)" }],
        h6: ["var(--text-h6)", { lineHeight: "var(--leading-h6)", letterSpacing: "var(--tracking-h6)", fontWeight: "var(--font-weight-medium)" }],
        "body-xl": ["var(--text-body-xl)", { lineHeight: "var(--leading-body-xl)", letterSpacing: "var(--tracking-body)" }],
        "body-lg": ["var(--text-body-lg)", { lineHeight: "var(--leading-body-lg)", letterSpacing: "var(--tracking-body)" }],
        "body-md": ["var(--text-body-md)", { lineHeight: "var(--leading-body-md)", letterSpacing: "var(--tracking-body)" }],
        "body-sm": ["var(--text-body-sm)", { lineHeight: "var(--leading-body-sm)", letterSpacing: "var(--tracking-body)" }],
        "label-lg": ["var(--text-label-lg)", { lineHeight: "var(--leading-label-lg)", letterSpacing: "var(--tracking-label-lg)", fontWeight: "var(--font-weight-semibold)" }],
        "label-md": ["var(--text-label-md)", { lineHeight: "var(--leading-label-md)", letterSpacing: "var(--tracking-label-md)", fontWeight: "var(--font-weight-semibold)" }],
        "label-sm": ["var(--text-label-sm)", { lineHeight: "var(--leading-label-sm)", letterSpacing: "var(--tracking-label-sm)", fontWeight: "var(--font-weight-semibold)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--leading-caption)", letterSpacing: "var(--tracking-caption)" }],
        overline: ["var(--text-overline)", { lineHeight: "var(--leading-overline)", letterSpacing: "var(--tracking-overline)", fontWeight: "var(--font-weight-semibold)" }]
      },
      lineHeight: {
        "body-md": "var(--leading-body-md)",
        "body-sm": "var(--leading-body-sm)",
        caption: "var(--leading-caption)"
      },
      letterSpacing: {
        body: "var(--tracking-body)",
        overline: "var(--tracking-overline)"
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 20, 20, 0.04)",
        elevated:
          "0 8px 24px rgba(20, 20, 20, 0.08), 0 2px 6px rgba(20, 20, 20, 0.04)",
        overlay:
          "0 20px 60px rgba(20, 20, 20, 0.16), 0 4px 12px rgba(20, 20, 20, 0.08)"
      },
      maxWidth: {
        site: "1280px",
        reading: "var(--content-reading-width)"
      }
    }
  },
  plugins: []
};

export default config;

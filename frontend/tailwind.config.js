/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Human-designed clinical palette (Max 3 core colors + neutrals)
        brand: {
          base: "#FAFBF9",        // Clean warm clinical ground
          surface: "#FFFFFF",     // Card / container surface
          ink: "#121C18",         // Authoritative deep forest ink text
          muted: "#4A5852",       // Secondary readable text
          border: "#D3DDD8",      // Architectural 1px hair-line border
          primary: "#0D5C4E",     // National Ayush deep pine green
          primaryHover: "#09453A",
          primarySoft: "#EAF3F0",
          accent: "#B91C1C",      // Clinical alert red (strictly reserved)
          accentSoft: "#FEF2F2",
          // Dark mode counterparts
          darkBase: "#0E1513",
          darkSurface: "#15201C",
          darkInk: "#F2F6F4",
          darkMuted: "#8D9E97",
          darkBorder: "#24352F",
          darkPrimary: "#15806C",
        },
        kiosk: {
          bg: "#FAFBF9",
          surface: "#FFFFFF",
          ink: "#121C18",
          muted: "#4A5852",
          border: "#D3DDD8",
          primary: "#0D5C4E",
          primaryDark: "#09453A",
          primarySoft: "#EAF3F0",
          alert: "#B91C1C",
          alertSoft: "#FEF2F2",
          warn: "#B45309",
          warnSoft: "#FFFBEB",
        },
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        sans: [
          "Noto Sans",
          "Noto Sans Devanagari",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        pill: "9999px",
      },
      boxShadow: {
        // Flat, crisp 1px borders with zero blurry drop-shadow bloat
        none: "none",
        subtle: "0 1px 2px 0 rgba(18, 28, 24, 0.04)",
        card: "0 1px 3px 0 rgba(18, 28, 24, 0.06)",
      },
    },
  },
  plugins: [],
};

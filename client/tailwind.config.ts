import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1D22",
        paper: "#F5F6F3",
        focus: "#33449E",
        priorityHigh: "#991B1B",
        priorityMedium: "#C2410C",
        priorityLow: "#0F766E",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
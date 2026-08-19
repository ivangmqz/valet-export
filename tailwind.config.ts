import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        valet: {
          50: "#f2f6ff",
          100: "#e0e9ff",
          200: "#c2d3ff",
          300: "#9ab3ff",
          400: "#6d8bff",
          500: "#4361ee",
          600: "#3346c9",
          700: "#28379e",
          800: "#1f2c7d",
          900: "#0f1740",
          950: "#0a0f2b"
        },
        gold: {
          400: "#e9c46a",
          500: "#d4a437",
          600: "#b8860b"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

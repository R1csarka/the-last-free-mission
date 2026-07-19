import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        asphalt: "#0E0E0E",
        gunmetal: "#181818",
        brass: "#D8AF3D",
        champagne: "#F8F8F8",
        dangerPink: "#D32F2F",
        approval: "#00C853"
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(216,175,61,0.28), 0 24px 80px rgba(0,0,0,0.6)",
        glow: "0 0 34px rgba(216,175,61,0.28)"
      },
      fontFamily: {
        display: ["Impact", "Haettenschweiler", "Arial Black", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

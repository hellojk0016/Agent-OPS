import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        "neon-blue": "rgb(var(--neon-blue-rgb) / <alpha-value>)",
        "neon-blue-rgb": "0, 245, 255",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        "neon-sm": "0 0 8px rgba(0, 245, 255, 0.2)",
        "neon": "0 0 20px rgba(0, 245, 255, 0.25), 0 4px 16px rgba(0, 245, 255, 0.15)",
        "neon-lg": "0 0 40px rgba(0, 245, 255, 0.3), 0 8px 32px rgba(0, 245, 255, 0.2)",
        "neon-xl": "0 0 0 1px rgba(0, 245, 255, 0.3), 0 0 60px rgba(0, 245, 255, 0.2)",
      },
      backgroundImage: {
        "gradient-neon": "linear-gradient(135deg, #00F5FF 0%, #70FFFF 100%)",
      },
      animation: {
        "slide-up": "slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

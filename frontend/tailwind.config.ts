import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554"
        },
        orange: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6c0c"
        },
        navy: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#263348"
        },
        ink: {
          900: "#101828",
          700: "#344054",
          500: "#667085"
        }
      },
      boxShadow: {
        soft: "0 4px 24px rgba(15, 23, 42, 0.06)",
        lift: "0 8px 40px rgba(15, 23, 42, 0.12)",
        glow: "0 0 40px rgba(59, 130, 246, 0.25)",
        "glow-orange": "0 0 30px rgba(249, 115, 22, 0.25)",
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(15,23,42,0.08)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(59,130,246,0.5), transparent)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)"
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        "slide-up": "slide-up 0.5s ease-out both",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

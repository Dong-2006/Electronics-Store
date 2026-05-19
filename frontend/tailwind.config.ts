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
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#172554"
        },
        ink: {
          900: "#101828",
          700: "#344054",
          500: "#667085"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        lift: "0 22px 55px rgba(15, 23, 42, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

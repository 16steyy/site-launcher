/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#0a0a0b",
          1: "#121214",
          2: "#19191c",
          3: "#222226",
          4: "#2b2b30",
        },
        fg: {
          DEFAULT: "#f1f1f3",
          muted: "#a1a1aa",
          faint: "#71717a",
        },
        accent: {
          DEFAULT: "#e4e4e7",
          from: "#f4f4f5",
          to: "#c9c9cf",
          hi: "#f4f4f5",
          bright: "#ffffff",
        },
        select: "#f4f4f5",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        sans: ['"Onest Variable"', "Onest", '"Segoe UI"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.625rem",
        "2xl": "0.875rem",
        "3xl": "1.125rem",
      },
    },
  },
  plugins: [],
};

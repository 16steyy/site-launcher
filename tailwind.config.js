/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#0b0910",
          1: "#14111b",
          2: "#1b1724",
          3: "#241e2f",
          4: "#2e2739",
        },
        fg: {
          DEFAULT: "#eee9f6",
          muted: "#a49cb4",
          faint: "#716a82",
        },
        accent: {
          DEFAULT: "#6a3ad0",
          from: "#582ec0",
          to: "#975ade",
          hi: "#cbb6f5",
          bright: "#a97ef2",
        },
        select: "#2468f2",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(88, 46, 192, 0.35)",
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

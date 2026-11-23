/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#fbf3f4", 100: "#f6e3e6", 200: "#ecc7cd", 500: "#b5495b", 600: "#9c3a4b", 700: "#7e2e3c", 900: "#4a1a23" },
        sand: { 50: "#faf7f4", 100: "#f2ece6", 200: "#e4dacf" },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
        sans: ["system-ui", "-apple-system", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

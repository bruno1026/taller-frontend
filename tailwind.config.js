/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          300: '#d1d5db', // Asegurar que gray-300 existe
        }
      }
    },
  },
  plugins: [],
}

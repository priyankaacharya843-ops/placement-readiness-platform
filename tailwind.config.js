/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(245, 58%, 51%)',
          hover: 'hsl(245, 58%, 45%)',
          light: 'hsl(245, 58%, 95%)',
        },
      },
    },
  },
  plugins: [],
}

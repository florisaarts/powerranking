/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00BFA6',
        'primary-dark': '#00A693',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        scan: 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        }
      }
    },
  },
  plugins: [],
}

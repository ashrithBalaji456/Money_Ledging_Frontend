/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Slate & Gold theme for a warm, premium, ledger-book aesthetic
        ledger: {
          50: '#fbfbf9',
          100: '#f6f5f0',
          200: '#ebeae0',
          300: '#dad7c8',
          400: '#c1baa5',
          500: '#a79e83',
          600: '#8c8266',
          700: '#726951',
          800: '#5c5441',
          900: '#4c4637',
          950: '#27241c',
        }
      }
    },
  },
  plugins: [],
}

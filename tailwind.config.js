/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FDFBF7',
          100: '#F7F2EA',
          200: '#EFE5D8',
          300: '#DECDBD',
          400: '#C2A790',
          500: '#A48265',
          600: '#876348',
          700: '#644833',
          800: '#453023',
          900: '#2A1C15',
          950: '#180F0B',
        },
        crema: {
          DEFAULT: '#C86A27',
          hover: '#B55A1A',
          light: '#FDF4EB',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


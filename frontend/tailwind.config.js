/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#9A7B1E',
          800: '#7C6316',
          900: '#5E4B0E',
          950: '#3B2E07',
        },
        accent: {
          50: '#FFF9ED',
          100: '#FFF0D0',
          200: '#FFE09C',
          300: '#FFCD5C',
          400: '#F5B82E',
          500: '#D4A02B',
          600: '#A67C1E',
          700: '#7D5E15',
          800: '#55420F',
          900: '#3D2E0A',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(212, 175, 55, 0.08)',
        'gold': '0 4px 20px 0 rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

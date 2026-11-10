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
        // Elevated Dark Theme Tokens (Screenshot 2 Palette)
        darkcanvas: {
          DEFAULT: '#0B0E14',
          alt: '#0F1219',
        },
        darkcard: {
          DEFAULT: '#181C24',
          elevated: '#1E232E',
          surface: '#1C1E24',
          border: '#2A303C',
        },
        // Light Mode Tokens (Soft Ivory & Warm Slate)
        ivory: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F4EFE6',
          border: '#E2E8F0',
        },
        // Primary Action & Failure Accent (Crimson Red)
        crimson: {
          DEFAULT: '#E63946',
          hover: '#DC2626',
          dark: '#B91C1C',
        },
        // Interactive Accents & Highlights (Warm Gold)
        gold: {
          DEFAULT: '#D4AF37',
          accent: '#C5A059',
          hover: '#B8942A',
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'card-sm': '0 2px 10px -1px rgba(0, 0, 0, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

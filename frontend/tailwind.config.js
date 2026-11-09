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
        // Linear/Vercel Dark Theme Tokens
        darkcanvas: {
          DEFAULT: '#0B0E14',
          alt: '#0F1219',
        },
        darkcard: {
          DEFAULT: '#14171F',
          elevated: '#1A1E29',
          border: '#262930',
        },
        // Light Mode Tokens (Soft Ivory & Warm Ivory Slate)
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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

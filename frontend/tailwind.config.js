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
        // Dark Mode Canvas Tokens (Midnight Navy)
        midnight: {
          950: '#070D1F',
          900: '#0A1128', // Midnight Navy Canvas / Header Structural Accent
          800: '#0D1B2A', // Midnight Navy Alternate / Deep Midnight
          700: '#142238',
          600: '#1E314B',
        },
        // Dark Mode Surface & Modal Tokens (Warm Stone Grey & Subtle Stone Slate)
        stonecard: {
          DEFAULT: '#1C1E24', // Warm Stone Grey Surface
          elevated: '#23272F', // Warm Stone Grey Elevated Modals & Surfaces
          border: '#323742',   // Subtle Stone Slate Border
          divider: '#2D3748',  // Subtle Stone Slate Divider
        },
        // Light Mode Tokens (Soft Ivory & Warm Ivory Slate)
        ivory: {
          50: '#FDFBF7',   // Soft Ivory Canvas Alt
          100: '#FAF8F5',  // Soft Ivory Canvas Main
          200: '#F4EFE6',
          border: '#E2E8F0', // Warm Ivory Slate Border
          borderSubtle: '#E5E7EB',
        },
        // Primary Action & Failure Accent (Crimson Red)
        crimson: {
          DEFAULT: '#E63946',
          hover: '#DC2626',
          dark: '#B91C1C',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#E63946',
          600: '#DC2626',
        },
        // Interactive Accents & Highlights (Warm Gold)
        gold: {
          DEFAULT: '#D4AF37',
          accent: '#C5A059',
          hover: '#B8942A',
          light: '#FBF5E6',
          50: '#FDFBF7',
          100: '#F7EFCF',
          400: '#E5C365',
          500: '#D4AF37',
          600: '#C5A059',
        },
        // Text & Secondary Labels
        sand: {
          muted: '#94A3B8', // Warm Sand/Grey Secondary Text
        },
        // Semantic and backward-compatible aliases
        navy: {
          950: '#070D1F',
          900: '#0A1128',
          800: '#0D1B2A',
          700: '#142238',
          600: '#1C1E24',
        },
        devpulse: {
          primary: '#0A1128',
          accent: '#D4AF37',
          gold: '#D4AF37',
          crimson: '#E63946',
          success: '#10B981',
          danger: '#E63946',
          warning: '#F59E0B',
        }
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px 0 rgba(15, 23, 42, 0.02)',
        'warm-md': '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'warm-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.07), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

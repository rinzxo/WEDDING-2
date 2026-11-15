/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Edensor"', '"Playfair Display"', 'Georgia', 'serif'],
        edensor: ['"Edensor"', '"Playfair Display"', 'Georgia', 'serif'],
        bodebeck: ['"Bodebeck"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Strawberrycupcakes"', '"Laluxe"', 'cursive'],
        strawberry: ['"Strawberrycupcakes"', 'cursive'],
        laluxe: ['"Laluxe"', 'cursive'],
        body: ['"Inter"', 'Arial', 'sans-serif'],
        sans: ['"Inter"', 'Arial', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        // Pastel soft blue & crisp white theme
        pastel: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc4fa',
          400: '#38a5f6',
          500: '#0f88eb',
          600: '#026ac7',
          700: '#0354a1',
          800: '#074784',
          900: '#0c3c6e',
        },
        // Mapped cinematic theme tokens for pastel blue + crisp white
        ink: {
          DEFAULT: '#0f172a', // Deep slate navy for crisp contrast
          90: 'rgba(15, 23, 42, 0.9)',
          78: 'rgba(15, 23, 42, 0.78)',
          70: 'rgba(15, 23, 42, 0.70)',
          65: 'rgba(15, 23, 42, 0.65)',
          55: 'rgba(15, 23, 42, 0.55)',
          45: 'rgba(15, 23, 42, 0.45)',
          35: 'rgba(15, 23, 42, 0.35)',
          20: 'rgba(15, 23, 42, 0.20)',
          15: 'rgba(15, 23, 42, 0.15)',
          10: 'rgba(15, 23, 42, 0.10)',
        },
        linen: '#f0f7ff', // Soft pastel ice blue
        clay: '#475569',  // Elegant slate for subtitles & eyebrows
        moss: '#1d4ed8',  // Primary interactive blue
        champagne: '#bfdbfe', // Soft pastel blue accent
        wedding: {
          navy: "#1e3a5f",
          dark: "#0f172a",
          deep: "#0c1e38",
          light: "#38bdf8",
          gold: "#3b82f6",
          "gold-light": "#93c5fd",
          cream: "#f0f7ff",
          sand: "#e2e8f0",
          card: "#ffffff",
          muted: "#64748b",
        },
      },
      boxShadow: {
        glow: '0 18px 60px rgba(37, 99, 235, 0.08)',
        'glow-soft': '0 20px 70px rgba(15, 23, 42, 0.06)',
        'card-blue': '0 10px 30px -5px rgba(59, 130, 246, 0.12)',
      },
      keyframes: {
        countdownPop: {
          '0%': { opacity: '0.68', transform: 'translateY(3px) scale(0.96)' },
          '55%': { opacity: '1', transform: 'translateY(-1px) scale(1.03)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        spinSlow: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        softFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '50%, 100%': { transform: 'translateX(250%) skewX(-20deg)' },
        },
        bloom: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pinBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
      },
      animation: {
        'countdown-tick': 'countdownPop 420ms ease-out',
        'spin-slow': 'spinSlow 12s linear infinite',
        'soft-float': 'softFloat 4s ease-in-out infinite',
        'float-gentle': 'softFloat 5s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'bloom': 'bloom 1200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pin-bounce': 'pinBounce 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};

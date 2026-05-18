/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#e6f9f9',
          100: '#ccf3f3',
          200: '#99e7e7',
          300: '#66dbdb',
          400: '#33cfcf',
          500: '#0bb2b2',
          600: '#0bb2b2',
          700: '#098f8f',
          800: '#076c6c',
          900: '#054949',
        },
        accent: {
          red:  '#da4b4f',
          pink: '#e25c99',
        },
        brand: {
          dark: '#2c3a8a',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
        ink: {
          DEFAULT: '#000000',
          muted:   '#64748b',
          light:   '#94a3b8',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0bb2b2 0%, #e25c99 100%)',
        'gradient-hero':    'linear-gradient(135deg, #2c3a8a 0%, #0bb2b2 100%)',
        'gradient-card':    'linear-gradient(135deg, #0bb2b2 0%, #2c3a8a 100%)',
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
        'card-hover': '0 10px 25px -5px rgba(11,178,178,.2), 0 4px 6px -2px rgba(11,178,178,.1)',
        'glow':  '0 0 0 3px rgba(11,178,178,.35)',
        'glow-sm': '0 0 0 2px rgba(11,178,178,.25)',
      },
      animation: {
        'fade-in':   'fadeIn .4s ease both',
        'slide-up':  'slideUp .45s ease both',
        'scale-in':  'scaleIn .3s ease both',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 },                         to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: 0, transform: 'scale(.95)' },       to: { opacity: 1, transform: 'scale(1)' } },
        pulseDot: { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.4)', opacity: .7 } },
      },
    },
  },
  plugins: [],
};

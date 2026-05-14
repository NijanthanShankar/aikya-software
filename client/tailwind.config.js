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
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted:   '#64748b',
          light:   '#94a3b8',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-hero':    'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        'gradient-card':    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
        'card-hover': '0 10px 25px -5px rgba(79,70,229,.15), 0 4px 6px -2px rgba(79,70,229,.08)',
        'glow':  '0 0 0 3px rgba(99,102,241,.35)',
        'glow-sm': '0 0 0 2px rgba(99,102,241,.25)',
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

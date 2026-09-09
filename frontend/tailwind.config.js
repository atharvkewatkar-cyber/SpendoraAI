/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a'
        },
        mint: {
          400: '#34d399', 500: '#10b981', 600: '#059669'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        cardDark: '0 1px 3px rgba(0,0,0,0.4)',
        glow: '0 0 0 1px rgba(59,130,246,0.15), 0 8px 24px rgba(59,130,246,0.15)'
      },
      keyframes: {
        fadeInUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(16px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out both',
        fadeIn: 'fadeIn 0.3s ease-out both',
        scaleIn: 'scaleIn 0.2s ease-out both',
        slideInRight: 'slideInRight 0.3s ease-out both',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}

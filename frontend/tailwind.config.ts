import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        forum: {
          bg: '#F4F8FF',
          surface: '#FFFFFF',
          primary: '#376BB4',
          secondary: '#5A8CFF',
          accent: '#DCE9FF',
          text: '#09111F'
        },
        uit: {
          50: '#F2F7FF',
          100: '#E5EEFF',
          200: '#C7DBFF',
          300: '#9EC0FF',
          400: '#70A3FF',
          500: '#376BB4',
          600: '#2457E6',
          700: '#1C44B4',
          800: '#18378F',
          900: '#142A68',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F0F4FA',
          200: '#D8E0EC',
          300: '#B3C0D1',
          400: '#7D90AA',
          500: '#596C87',
          600: '#41526B',
          700: '#2C3A4E',
          800: '#1B2433',
          900: '#0D1523',
        },
        ai: {
          cyan: '#48C8FF',
          mint: '#59D7B8',
          violet: '#88A8FF',
        },
      },
      boxShadow: {
        card: '0 18px 40px rgba(17, 38, 79, 0.10)',
        dashboard: '0 28px 60px rgba(17, 38, 79, 0.14)',
        gradient: '0 24px 60px rgba(36, 87, 230, 0.24)',
        glass: '0 18px 45px rgba(15, 31, 68, 0.12)',
      },
      animation: {
        'gradient': 'gradient 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      }
    }
  },
  plugins: []
};

export default config;

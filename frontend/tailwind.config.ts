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
          bg: '#FFFFFF',
          surface: '#1E1E1E',
          primary: '#376BB4',
          secondary: '#547AA5',
          accent: '#88DAAD',
          text: '#151515'
        }
      },
      boxShadow: {
        card: '0 10px 24px rgba(20, 20, 20, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;

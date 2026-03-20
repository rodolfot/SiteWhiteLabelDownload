import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bbd8ff',
          300: '#8cc0ff',
          400: '#569dff',
          500: '#2d78ff',
          600: '#1555f5',
          700: '#0e40e1',
          800: '#1234b6',
          900: '#15308f',
          950: '#111f57',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          cyan: '#22d3ee',
        },
        surface: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#22222f',
          500: '#2a2a3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.8) 50%, #0a0a0f 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

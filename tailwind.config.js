/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Spa/Wellness Professional Color Palette
        sage: {
          50: '#f6f8f6',
          100: '#e3e8e3',
          200: '#c7d1c7',
          300: '#9caf88', // Primary sage green
          400: '#7a9266',
          500: '#5e7050',
          600: '#4a5840',
          700: '#3d4635',
          800: '#33382d',
          900: '#2b2f26',
        },
        earth: {
          50: '#faf9f7',
          100: '#ede8d0', // Warm beige
          200: '#ddd5bb',
          300: '#c7b99a',
          400: '#b09d7a',
          500: '#9b8762',
          600: '#837055',
          700: '#6b5947',
          800: '#54463a', // Deep taupe
          900: '#463a31',
        },
        accent: {
          coral: '#ff6b6b',
          mint: '#a8e6cf',
          lavender: '#dda0dd',
        },
        // Legacy colors for backward compatibility
        primary: {
          50: '#f6f8f6',
          100: '#e3e8e3',
          200: '#c7d1c7',
          300: '#9caf88',
          400: '#7a9266',
          500: '#9caf88', // Map to sage
          600: '#5e7050',
          700: '#4a5840',
          800: '#3d4635',
          900: '#2b2f26',
        },
        secondary: {
          50: '#faf9f7',
          100: '#ede8d0',
          200: '#ddd5bb',
          300: '#c7b99a',
          400: '#b09d7a',
          500: '#c8a882', // Warm secondary
          600: '#9b8762',
          700: '#837055',
          800: '#6b5947',
          900: '#54463a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
      boxShadow: {
        'spa': '0 4px 6px -1px rgba(156, 175, 136, 0.1), 0 2px 4px -1px rgba(156, 175, 136, 0.06)',
        'spa-lg': '0 10px 15px -3px rgba(156, 175, 136, 0.1), 0 4px 6px -2px rgba(156, 175, 136, 0.05)',
      },
    },
  },
  plugins: [],
};
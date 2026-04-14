/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        parchment: '#f4e9d8',
        ink: '#2b1a1a',
        gold: '#a3802e',
      },
    },
  },
  plugins: [],
};

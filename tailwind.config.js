/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        // CSS variable–based so dark mode flips them automatically via html.dark overrides.
        parchment: 'rgb(var(--color-parchment) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

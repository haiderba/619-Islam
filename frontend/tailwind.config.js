/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // enable dark mode via 'dark' class
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', '"Traditional Arabic"', 'serif'],
      },
      colors: {
        // Shared colors
        primary: {
          DEFAULT: '#F97316', // Orange highlight
          light: '#FB923C',
          dark: '#EA580C',
        },
        accentGold: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        accentCyan: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        
        // Custom semantic colors that work well with dark mode toggles
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        subtext: 'var(--color-subtext)',
        muted: 'var(--color-muted)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'bg-light-1': 'var(--color-bg-light-1)',
        'bg-light-2': 'var(--color-bg-light-2)',
        celeste1: 'var(--color-celeste-1)',
        celeste2: 'var(--color-celeste-2)',
        green1: 'var(--color-green-1)',
        green2: 'var(--color-green-2)',
        success: 'var(--color-success)',
        'success-alt': 'var(--color-success-alt)',
        warning: 'var(--color-warning)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        white: 'var(--color-white)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
      },
    },
  },
  plugins: [],
}

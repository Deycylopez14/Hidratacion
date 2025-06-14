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
        'primary-dark': 'var(--color-primary-dark)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        muted: 'var(--color-muted)',
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',

        aqua: '#50C7EC',        // Azul Agua
        lightblue: '#A0E7FF',   // Azul Claro
        turquoise: '#00D4D8',   // Turquesa
        white: '#FFFFFF',       // Blanco
        darkblue: '#0077B6',    // Azul Oscuro
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-red' : 'var(--color-custom-red)',
        'custom-blue' : 'var(--color-custom-blue)',
        'custom-yellow' : 'var(--color-custom-yellow)',
        'custom-lightred' : 'var(--color-custom-lightred)',
      },
    },
  },
  plugins: [],
}


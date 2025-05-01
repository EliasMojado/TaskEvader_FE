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
        'palm-blue': "#001F54",
        'carribean-current': "#197278",
        'uranian-blue': "#B4D3F9",
        'whitish': "#FEFEFF",
        'icterine': "#F9F94D",
        'pastel-red': "#FC7554",
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'viga': ['Viga', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


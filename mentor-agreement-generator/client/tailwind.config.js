/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep:   '#1A1AE6',
          mid:    '#3333CC',
          peri:   '#7B7BE8',
          pale:   '#A0A0F5',
          offwhite: '#F4F4FB',
          navy:   '#1C1C2E',
          gray:   '#4A4A6A',
        },
      },
      fontFamily: {
        sans: ['Calibri', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

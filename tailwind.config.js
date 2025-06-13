/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.{js,ts,jsx,tsx,css}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        ritual: ['Marcellus', 'serif'],
        system: ['Spline Sans Mono', 'monospace'],
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      colors: {
        dusk: '#6e6655',
        bronze: '#a88d54',
        grain: '#f9f7f5',
      },
      backgroundColor: {
        dark: '#0f0e11',
        grove: '#1a181e',
      },
      textColor: {
        scroll: '#eae6dd',
      },
    },
  },
  plugins: [],
};

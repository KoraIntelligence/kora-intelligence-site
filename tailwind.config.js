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
      typography: (theme) => ({
        amber: {
          css: {
            color: theme('colors.amber.800'),
            a: { color: theme('colors.amber.700') },
            strong: { color: theme('colors.amber.900') },
            h1: { color: theme('colors.amber.800') },
            h2: { color: theme('colors.amber.800') },
            h3: { color: theme('colors.amber.800') },
            blockquote: { color: theme('colors.amber.700') },
            code: { color: theme('colors.amber.800') },
          },
        },
        dark: {
          css: {
            color: theme('colors.amber.100'),
            a: { color: theme('colors.amber.300') },
            strong: { color: theme('colors.amber.200') },
            h1: { color: theme('colors.amber.100') },
            h2: { color: theme('colors.amber.100') },
            h3: { color: theme('colors.amber.100') },
            blockquote: { color: theme('colors.amber.300') },
            code: { color: theme('colors.amber.200') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

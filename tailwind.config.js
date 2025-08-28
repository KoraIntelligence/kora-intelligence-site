/** @type {import('tailwindcss').Config} */
const { amber } = require('tailwindcss/colors');

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
            '--tw-prose-body': theme('colors.amber.800'),
            '--tw-prose-headings': theme('colors.amber.900'),
            '--tw-prose-lead': theme('colors.amber.700'),
            '--tw-prose-links': theme('colors.amber.700'),
            '--tw-prose-bold': theme('colors.amber.900'),
            '--tw-prose-counters': theme('colors.amber.600'),
            '--tw-prose-bullets': theme('colors.amber.400'),
            '--tw-prose-hr': theme('colors.amber.300'),
            '--tw-prose-quotes': theme('colors.amber.900'),
            '--tw-prose-quote-borders': theme('colors.amber.300'),
            '--tw-prose-captions': theme('colors.amber.500'),
            '--tw-prose-code': theme('colors.amber.900'),
            '--tw-prose-pre-code': theme('colors.amber.100'),
            '--tw-prose-pre-bg': theme('colors.amber.900'),
            '--tw-prose-th-borders': theme('colors.amber.300'),
            '--tw-prose-td-borders': theme('colors.amber.200'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

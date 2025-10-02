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
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Spline Sans Mono', 'monospace'], // keep if you use monospace
  },
      colors: {
        // Keep Tailwind defaults, no more "grain/bronze/grove/scroll"
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.amber.600'),
              textDecoration: 'none',
              '&:hover': { opacity: 0.7 },
            },
            strong: { color: theme('colors.gray.900') },
            h1: { color: theme('colors.amber.600') },
            h2: { color: theme('colors.gray.900') },
            h3: { color: theme('colors.gray.900') },
            blockquote: { color: theme('colors.gray.600') },
            code: { color: theme('colors.pink.600') },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.100'),
            a: {
              color: theme('colors.amber.400'),
              textDecoration: 'none',
              '&:hover': { opacity: 0.8 },
            },
            strong: { color: theme('colors.gray.100') },
            h1: { color: theme('colors.amber.400') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            blockquote: { color: theme('colors.gray.300') },
            code: { color: theme('colors.pink.400') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

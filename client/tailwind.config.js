/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'steins': {
          purple: '#9333ea',
          dark: '#1e1b4b',
        }
      },
      typography: {
        invert: {
          css: {
            color: '#e2e8f0',
            a: {
              color: '#c084fc',
              '&:hover': {
                color: '#a855f7',
              },
            },
            strong: {
              color: '#f1f5f9',
            },
            code: {
              color: '#f1f5f9',
            },
            h1: {
              color: '#f1f5f9',
            },
            h2: {
              color: '#f1f5f9',
            },
            h3: {
              color: '#f1f5f9',
            },
            h4: {
              color: '#f1f5f9',
            },
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

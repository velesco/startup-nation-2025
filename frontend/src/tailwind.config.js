/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#EFF6FF',
          500: '#2962FF',
          600: '#0041D0',
          700: '#00329E'
        },
        purple: {
          600: '#6C5CE7'
        },
        orange: {
          400: '#FF7940',
          500: '#FF6016'
        },
        pink: {
          500: '#FF4B77'
        },
        green: {
          400: '#00D68F',
          500: '#00B477'
        },
        teal: {
          500: '#00D8C9'
        }
      }
    }
  },
  plugins: [],
}

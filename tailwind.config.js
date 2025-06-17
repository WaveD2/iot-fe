/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{tsx,ts,jsx,js}'],
    theme: {
      extend: {
        keyframes: {
          slideUp: {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(0)', opacity: '1' },
            '100%': { transform: 'translateY(100%)', opacity: '0' },
          },
        },
        animation: {
          slideUp: 'slideUp 0.3s ease-out',
          slideDown: 'slideDown 0.3s ease-out',
        },
      },
    },
    plugins: [],
  }
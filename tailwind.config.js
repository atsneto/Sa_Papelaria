/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./JS/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        rosa: '#F089AE',
        'rosa-suave': '#FDEDF2',
        azul: '#9CC4E7',
        amarelo: '#F9E55B'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}

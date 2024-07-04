/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        'primary': '#67DAB1'
      },
      blur: {
        '15px': '15px',
      },
    },
  },
  plugins: [],
}


module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/assets/stylesheets/**/*.css',
    './app/assets/stylesheets/**/*.scss'
  ],
  theme: {
    extend: {
      colors: {
        'purple-500': '#9d4edd',
        'red-500': '#e63946',
        'pink-500': '#d6336c',
        'green-400': '#68d391',
        'blue-500': '#4299e1',
      },
    },
  },
  plugins: [],
}

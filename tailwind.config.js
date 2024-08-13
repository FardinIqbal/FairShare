/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/assets/stylesheets/**/*.css', // Add this line if you want to include CSS files
    './app/assets/stylesheets/**/*.scss' // Include SCSS files if you are using them
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

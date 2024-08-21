module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}',
    './app/components/**/*.{erb,haml,html,slim,rb}',
    './config/initializers/simple_form_tailwind.rb',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  mode: 'jit',
};

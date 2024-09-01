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
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3366CC',
          '50': '#FFFFFF',
          '100': '#E5EDFF',
          '200': '#B3CCFF',
          '300': '#80AAFF',
          '400': '#4D88FF',
          '500': '#3366CC',
          '600': '#0044CC',
          '700': '#003399',
          '800': '#002266',
          '900': '#001133',
        },
        coral: {
          DEFAULT: '#FF6F61',
          '50': '#FFFFFF',
          '100': '#FFF8F7',
          '200': '#FFD1CB',
          '300': '#FFAA9F',
          '400': '#FF8D80',
          '500': '#FF6F61',
          '600': '#FF4733',
          '700': '#FF1F05',
          '800': '#D61700',
          '900': '#A81300',
        },
      },
    },
  },
  plugins: [],
  mode: 'jit',
};
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}',
    './app/components/**/*.{erb,haml,html,slim,rb}', // Add this line if you're using ViewComponents
    './config/initializers/simple_form_tailwind.rb', // Add this line if you're using Simple Form with Tailwind
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          light: '#93c5fd',  // Light blue for hover states or light backgrounds
          DEFAULT: '#3b82f6', // Default blue
          dark: '#1e3a8a',    // Dark blue for headers or emphasis
        },
        secondary: {
          light: '#6ee7b7',   // Light green for subtle accents
          DEFAULT: '#10b981', // Default green
          dark: '#047857',    // Dark green for emphasis
        },
        accent: {
          light: '#fdba74',   // Light orange for hover states or light accents
          DEFAULT: '#fb923c', // Default orange
          dark: '#c2410c',    // Dark orange for emphasis or alerts
        },
        neutral: {
          light: '#f3f4f6',   // Light gray for backgrounds
          DEFAULT: '#d1d5db', // Default gray for borders and text
          dark: '#374151',    // Dark gray for text
        },
        white: '#ffffff',
        black: '#000000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/aspect-ratio'), // Add this if you need it
  ],
  // Enable JIT mode for faster builds
  mode: 'jit',
  // Purge unused styles in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './app/**/*.html.erb',
      './app/helpers/**/*.rb',
      './app/javascript/**/*.js',
      './app/javascript/**/*.vue',
      './app/**/*.html.slim',
      './app/**/*.html.haml',
    ],
  },
}

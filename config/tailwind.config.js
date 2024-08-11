const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
        accent: '#F59E0B', // Amber
        background: '#F3F4F6', // Light Gray
        'text-primary': '#1F2937', // Dark Gray
        'text-light': '#6B7280', // Medium Gray
        error: '#EF4444', // Red
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        border: '#E5E7EB', // Light Gray Border
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};

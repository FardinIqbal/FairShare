const defaultTheme = require('tailwindcss/defaultTheme')

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
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      zIndex: {
        '-10': '-10',
        '-20': '-20',
        '60': '60',
        '70': '70',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover', 'focus', 'active'],
      textColor: ['hover', 'focus', 'active'],
      borderColor: ['hover', 'focus', 'active'],
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  mode: 'jit',
  purge: {
    content: [
      './app/**/*.html.erb',
      './app/helpers/**/*.rb',
      './app/javascript/**/*.js',
      './app/javascript/**/*.vue',
      './app/**/*.html.slim',
      './app/**/*.html.haml',
    ],
    options: {
      safelist: [
        /^bg-/,
        /^text-/,
        /^border-/,
        /^hover:/,
        /^focus:/,
        /^active:/,
        /^disabled:/,
        /^sm:/,
        /^md:/,
        /^lg:/,
        /^xl:/,
        /^2xl:/,
      ],
    },
  },
}
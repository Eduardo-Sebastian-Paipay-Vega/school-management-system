import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand primary & secondary
        brand: {
          DEFAULT: 'var(--primary-colors-primary-brand)',
          secondary: 'var(--primary-colors-secondary-brand)',
          dark: 'var(--secondary-colors-primary-brand-dark)',
          light: 'var(--secondary-colors-primary-brand-light)',
        },
        tan: 'var(--secondary-colors-tan)',

        // Neutrals & Grays
        gray: {
          100: 'var(--secondary-colors-gray-100)',
          200: 'var(--secondary-colors-gray-200)',
          300: 'var(--secondary-colors-gray-300)',
          400: 'var(--secondary-colors-gray-400)',
          500: 'var(--secondary-colors-gray-500)',
          600: 'var(--secondary-colors-gray-600)',
          700: 'var(--secondary-colors-gray-700)',
          800: 'var(--secondary-colors-gray-800)',
          900: 'var(--secondary-colors-gray-900)',
          black: 'var(--secondary-colors-black)',
        },

        // Accents
        accent: {
          ivory: 'var(--accent-colors-ivory)',
          cream: 'var(--accent-colors-cream)',
          rouge: 'var(--accent-colors-rouge)',
          gold: 'var(--accent-colors-gold)',
          olive: 'var(--accent-colors-olive)',
          green: 'var(--accent-colors-green)',
          teal: 'var(--accent-colors-teal)',
          cobalt: 'var(--accent-colors-cobalt)',
          purple: 'var(--accent-colors-purple)',
        },

        // Links
        link: {
          DEFAULT: 'var(--links-link)',
          hover: 'var(--links-link-hover)',
          'on-dark': 'var(--links-link-on-dark)',
          'on-dark-hover': 'var(--links-link-on-dark-hover)',
        },

        // Utilities
        utility: {
          success: 'var(--utilities-success)',
          error: 'var(--utilities-error)',
          warning: 'var(--utilities-warning)',
          info: 'var(--utilities-info)',
        },

        // Backward compatibility & semantic aliases
        navy: 'var(--secondary-colors-primary-brand-dark)',
        cyan: 'var(--primary-colors-primary-brand)',
        sea: 'var(--secondary-colors-primary-brand-light)',
        soft: 'var(--accent-colors-ivory)',
      },
      boxShadow: {
        card: '0 10px 35px rgba(60, 0, 0, 0.08)',
        elevated: '0 20px 40px rgba(80, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;

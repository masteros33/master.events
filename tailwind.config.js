/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5A1F',
          'orange-hover': '#E04810',
          canvas: '#FAF9F5',
          card: '#FFFFFF',
          text: '#121212',
          muted: '#666666',
        },
        fintech: {
          slate: '#0F172A',
          green: '#10B981',
          blue: '#2563EB',
          gray: '#F8FAFC',
        },
        pastel: {
          orange: '#FFEADF',
          blue: '#E0EEFE',
          green: '#E2F0D9',
          pink: '#FDE2E4',
        },
        // Deprecated: alias to brand.orange / brand.orange-hover so the
        // 19 files still on the v1 token names don't break mid-rollout.
        // Remove once every file in the v2 rollout list is migrated.
        primary: '#FF5A1F',
        'primary-dark': '#E04810',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

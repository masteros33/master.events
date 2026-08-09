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
          orange: '#1c2e53',
          'orange-hover': '#16233F',
          // ── FIX: these four were hardcoded light-mode-only hex
          // values, so bg-brand-canvas / bg-brand-card / text-brand-text
          // / text-brand-muted never responded to dark mode toggling —
          // that's the root cause of the dark mode bug. index.css
          // already defines proper light AND dark variants of these via
          // --bg / --bg-card / --text-primary / --text-muted (switched
          // by the [data-theme="dark"] selector) — pointing these
          // tokens at those variables instead of fixed hex means every
          // component using these classes now actually follows theme
          // state automatically, with zero changes needed in any
          // individual component file. ──
          canvas: 'var(--bg)',
          card:   'var(--bg-card)',
          text:   'var(--text-primary)',
          muted:  'var(--text-muted)',
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
          navy: '#EBEEF5',
        },
        primary: '#1c2e53',
        'primary-dark': '#16233F',
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
        display: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
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
          // ── v3 canonical accent name. `orange`/`orange-hover` below
          // are kept as deprecated aliases (same hex) so the ~19 files
          // still using those class names don't break before their
          // turn in the rollout — remove once every file is migrated. ──
          accent: '#1c2e53',
          'accent-hover': '#16233F',
          orange: '#1c2e53',
          'orange-hover': '#16233F',
          canvas: 'var(--bg)',
          card:   'var(--bg-card)',
          text:   'var(--text-primary)',
          muted:  'var(--text-muted)',
          hairline: 'var(--border)',
          // ── NEW: previously missing entirely, so every
          // "border-gray-100" etc across the app fell back to
          // Tailwind's hardcoded default gray scale below instead.
          border:        'var(--border)',
          'border-strong': 'var(--border-strong)',
          subtle:        'var(--bg-subtle)',
        },
        // ── NEW: this is the real fix. Tailwind's DEFAULT gray scale
        // (gray-50, gray-100, gray-200, gray-400, gray-600) is used
        // hardcoded, unthemed, throughout nearly every screen in this
        // app — for card borders, subtle backgrounds, and secondary
        // text. Overriding these specific shades to point at the same
        // CSS variables index.css already defines light/dark values
        // for means every existing "bg-gray-100", "border-gray-200",
        // "text-gray-400" etc across the ENTIRE codebase becomes
        // theme-aware automatically — no component files need
        // touching for this alone. Shades not listed here (500, 700,
        // 800, 900) fall through to Tailwind's real defaults, since
        // they're rarely used for backgrounds/borders in this app. ──
        gray: {
          50:  'var(--bg-subtle)',
          100: 'var(--border)',
          200: 'var(--border-strong)',
          300: 'var(--border-strong)',
          400: 'var(--text-muted)',
          600: 'var(--text-secondary)',
        },
        // ── NEW: status colors (error/success backgrounds) also
        // hardcoded — a light pink/green card looks genuinely wrong
        // floating on a dark background. Mapping the light "-50"
        // background shades to the real error/success bg variables
        // fixes the worst of it; the darker text shades (red-600,
        // emerald-700) stay Tailwind's real saturated defaults since
        // those already read fine against a dark background. ──
        red: {
          50: 'var(--error-bg)',
        },
        emerald: {
          50: 'var(--success-bg)',
        },
        fintech: {
          slate: '#0F172A',
          green: '#10B981',
          blue: '#2563EB',
          // ── FIX: was a hardcoded light hex, used across Checkout,
          // TicketView, PaymentSuccess, Resale, Transfer, and
          // OrganizerWallet as a page-background layer distinct from
          // brand-canvas. Now points at the same --bg-subtle variable
          // that already has correct light/dark values defined. ──
          gray: 'var(--bg-subtle)',
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
        full: '9999px',
        // ── Deprecated alias, not part of the v3 scale (12/16/999 only).
        // 12 files besides LandingPage.jsx still use `rounded-3xl` and
        // haven't had their rollout turn yet — removing this outright
        // would silently square off their cards' corners. Remove once
        // every file in the rollout order is confirmed off `rounded-3xl`. ──
        '3xl': '1rem',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
import type { Config } from 'tailwindcss';

/**
 * FamilyHub Design Tokens
 * ------------------------------------------------------------------
 * Palette concept: "Dusk & Hearth"
 * The hour when everyone comes home — a soft indigo dusk sky outside,
 * a warm porch-light amber glow inside. Calm, trustworthy, never cold.
 *
 *  dusk    #2B2E4A  -- deep indigo, primary dark surface / brand ink
 *  twilight#4C5578  -- secondary surface, muted indigo
 *  linen   #F7F5F2  -- warm off-white, primary light surface
 *  hearth  #E08E45  -- porch-light amber, primary accent
 *  ember   #C4693A  -- deeper amber-terracotta, hover/active accent
 *  sage    #7C9885  -- muted green, success / calm secondary accent
 * ------------------------------------------------------------------
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dusk: {
          DEFAULT: '#2B2E4A',
          50: '#EDEEF3',
          100: '#D7D8E5',
          200: '#B0B2CB',
          300: '#888BB1',
          400: '#61649C',
          500: '#4C5578', // twilight
          600: '#3B3E5E',
          700: '#2B2E4A',
          800: '#1D1F33',
          900: '#101122',
          950: '#080913',
        },
        linen: {
          DEFAULT: '#F7F5F2',
          100: '#FFFFFF',
          200: '#F7F5F2',
          300: '#EDE9E3',
          400: '#DDD6CC',
        },
        hearth: {
          DEFAULT: 'rgb(var(--hearth-400) / <alpha-value>)',
          50: 'rgb(var(--hearth-50) / <alpha-value>)',
          100: 'rgb(var(--hearth-100) / <alpha-value>)',
          200: 'rgb(var(--hearth-200) / <alpha-value>)',
          300: 'rgb(var(--hearth-300) / <alpha-value>)',
          400: 'rgb(var(--hearth-400) / <alpha-value>)', // primary accent
          500: 'rgb(var(--hearth-500) / <alpha-value>)', // hover/active
          600: 'rgb(var(--hearth-600) / <alpha-value>)',
          700: 'rgb(var(--hearth-700) / <alpha-value>)',
          800: 'rgb(var(--hearth-800) / <alpha-value>)',
          900: 'rgb(var(--hearth-900) / <alpha-value>)',
        },
        sage: {
          DEFAULT: '#7C9885',
          50: '#EEF3F0',
          100: '#DCE7DF',
          300: '#A9C0AF',
          400: '#7C9885',
          500: '#5E7A67',
          600: '#475D4E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Type scale — 1.25 (major third) ratio, tuned for a warm editorial feel
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.3rem' }],
        base: ['1rem', { lineHeight: '1.6rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem' }],
        xl: ['1.25rem', { lineHeight: '1.8rem' }],
        '2xl': ['1.563rem', { lineHeight: '2.1rem' }],
        '3xl': ['1.953rem', { lineHeight: '2.4rem' }],
        '4xl': ['2.441rem', { lineHeight: '2.8rem' }],
        '5xl': ['3.052rem', { lineHeight: '3.4rem' }],
        '6xl': ['3.815rem', { lineHeight: '4.1rem' }],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.625rem',
        md: '0.875rem',
        lg: '1.25rem',
        xl: '1.75rem',
        '2xl': '2.25rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(43, 46, 74, 0.08), 0 4px 16px -4px rgba(43, 46, 74, 0.06)',
        card: '0 4px 20px -4px rgba(43, 46, 74, 0.10), 0 2px 8px -2px rgba(43, 46, 74, 0.06)',
        lifted: '0 12px 40px -8px rgba(43, 46, 74, 0.18)',
        glow: '0 0 0 1px rgba(224, 142, 69, 0.15), 0 8px 30px -6px rgba(224, 142, 69, 0.25)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      transitionTimingFunction: {
        hearth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'check-pop': 'checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'badge-in': 'badgeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bounce-once': 'bounceOnce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0.5) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.15) rotate(4deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        badgeIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.22)' },
          '60%': { transform: 'scale(0.95)' },
        },
      },
      backgroundImage: {
        'dusk-gradient': 'linear-gradient(160deg, #2B2E4A 0%, #4C5578 55%, #7C6A5C 100%)',
        'hearth-glow': 'radial-gradient(circle at 50% 0%, rgba(224,142,69,0.18), transparent 60%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

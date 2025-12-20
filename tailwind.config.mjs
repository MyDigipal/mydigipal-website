import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // ===== COULEURS =====
      colors: {
        // Primary palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3B82F6', // Main accent
          600: '#2563EB', // Hover
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Neutral palette (Slate)
        slate: {
          50: '#F8FAFC',  // Surface/Background alt
          100: '#f1f5f9',
          200: '#E2E8F0', // Borders
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748B', // Secondary text
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0F172A', // Primary text
          950: '#020617',
        },
        // Service accent colors
        service: {
          seo: '#10B981',      // Emerald
          ads: '#F59E0B',      // Amber
          social: '#8B5CF6',   // Violet
          abm: '#EC4899',      // Pink
        },
      },

      // ===== TYPOGRAPHIE =====
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.5' }],
      },

      // ===== ESPACEMENTS =====
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },

      // ===== BORDURES =====
      borderRadius: {
        '4xl': '2rem',
      },

      // ===== OMBRES =====
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.1)',
        'medium': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 8px 24px -4px rgb(0 0 0 / 0.12)',
        'strong': '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 16px 48px -8px rgb(0 0 0 / 0.15)',
      },

      // ===== ANIMATIONS =====
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // ===== TRANSITIONS =====
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ===== CONTAINER =====
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },

      // ===== MAX WIDTH =====
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [typography],
};

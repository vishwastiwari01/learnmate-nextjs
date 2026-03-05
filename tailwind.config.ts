import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          base:     '#07090F',
          surface:  '#0D1017',
          elevated: '#111520',
          card:     '#161B28',
        },
        brand: {
          orange: '#FF6B2B',
          yellow: '#F5C542',
          green:  '#00D68F',
          cyan:   '#00C9E4',
          purple: '#7C3AED',
          pink:   '#FF4FA3',
          red:    '#FF4757',
        },
      },
      animation: {
        'float-up':    'floatUp 1.2s ease forwards',
        'fade-up':     'fadeUp 0.35s ease both',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'rope-shake':  'ropeShake 0.3s ease',
        'bounce-in':   'bounceIn 0.5s cubic-bezier(.34,1.56,.64,1)',
        'wave':        'wave 3s ease-in-out infinite',
        'drift':       'drift linear infinite',
      },
      keyframes: {
        floatUp:    { '0%': { opacity: '1', transform: 'translateY(0)' }, '100%': { opacity: '0', transform: 'translateY(-80px)' } },
        fadeUp:     { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        pulseGlow:  { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        ropeShake:  { '0%,100%': { transform: 'scaleX(1)' }, '50%': { transform: 'scaleX(1.04)' } },
        bounceIn:   { '0%': { transform: 'scale(0)' }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)' } },
        wave:       { '0%,100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(-20px)' } },
        drift:      { from: { transform: 'translateY(110vh)', opacity: '0' }, '10%,90%': { opacity: '1' }, to: { transform: 'translateY(-10vh)', opacity: '0' } },
      },
      boxShadow: {
        'glow-orange': '0 0 24px rgba(255,107,43,0.3)',
        'glow-purple': '0 0 24px rgba(124,58,237,0.3)',
        'glow-green':  '0 0 24px rgba(0,214,143,0.25)',
        'glow-cyan':   '0 0 24px rgba(0,201,228,0.25)',
      },
    },
  },
  plugins: [],
}
export default config

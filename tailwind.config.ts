import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1A1A2E',
          mid: '#16213E',
          card: '#0F3460',
        },
        dice: {
          dn:   '#546E7A',
          d100: '#B71C1C',
          d20:  '#E65100',
          d12:  '#F9A825',
          d10:  '#2E7D32',
          d8:   '#00695C',
          d6:   '#1565C0',
          d4:   '#6A1B9A',
          d3:   '#4527A0',
          d2:   '#37474F',
          df:   '#616161',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bh: {
          bg: 'rgb(2 6 23)', // slate-950
          surface: 'rgb(15 23 42 / 0.5)', // slate-900/50
          card: 'rgb(2 6 23 / 0.5)', // slate-950/50
          border: 'rgb(30 41 59)', // slate-800
          'border-subtle': 'rgb(30 41 59 / 0.8)',
          muted: 'rgb(100 116 139)', // slate-500
          subtle: 'rgb(148 163 184)', // slate-400
          text: 'rgb(241 245 249)', // slate-100
          'text-secondary': 'rgb(226 232 240)', // slate-200
          xp: 'rgb(16 185 129 / 0.9)', // emerald-500/90
          hp: 'rgb(244 63 94 / 0.85)', // rose-500/85
          attack: 'rgb(225 29 72 / 0.8)', // rose-600/80
          'attack-hover': 'rgb(244 63 94 / 0.9)',
          'attack-active': 'rgb(190 18 60)', // rose-700
          victory: 'rgb(16 185 129 / 0.7)', // emerald-400/70
        },
      },
      spacing: {
        panel: '0.75rem', // p-3
      },
    },
  },
  plugins: [],
};

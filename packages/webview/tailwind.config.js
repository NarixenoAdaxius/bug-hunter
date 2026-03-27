/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'bh-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'bh-bounce': 'bh-bounce 2.2s ease-in-out infinite',
      },
      colors: {
        bh: {
          bg: 'var(--bh-bg)',
          surface: 'var(--bh-surface)',
          card: 'var(--bh-card)',
          border: 'var(--bh-border)',
          'border-subtle': 'var(--bh-border-subtle)',
          muted: 'var(--bh-muted)',
          subtle: 'var(--bh-subtle)',
          text: 'var(--bh-text)',
          'text-secondary': 'var(--bh-text-secondary)',
          xp: 'var(--bh-xp)',
          hp: 'var(--bh-hp)',
          attack: 'var(--bh-attack)',
          'attack-hover': 'var(--bh-attack-hover)',
          'attack-active': 'var(--bh-attack-active)',
          victory: 'var(--bh-victory)',
        },
      },
      spacing: {
        panel: '0.75rem',
      },
    },
  },
  plugins: [],
};

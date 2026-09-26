module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gis: {
          base: '#0A0A0F',
          card: '#14100F',
          accent: '#FF1E3C', // Electric Red
          secondary: '#FF6A00', // Hot Orange
          tertiary: '#00E5FF', // Neon Cyan
          muted: '#8A8A8E',
          line: '#2A2A2E',
          ink: '#FFFFFF',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradientX 15s ease infinite',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gis-navy': '#0f172a',
        'gis-accent': '#38bdf8',
        'gis-bg': '#020617',
        'gis-card': '#1e293b',
        'gis-ink': '#f8fafc',
        'gis-muted': '#94a3b8',
        'gis-line': '#334155',
      },
    },
  },
  plugins: [],
}

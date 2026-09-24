/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0a0d14',
          card: '#121826',
          border: '#1f293d',
          accent: '#e11d48',
          accentHover: '#be123c',
          gold: '#f59e0b',
          recliner: '#9333ea',
          premium: '#4f46e5',
          silver: '#64748b',
          booked: '#334155',
          locked: '#ea580c',
        },
      },
      boxShadow: {
        'glow-crimson': '0 0 25px -5px rgba(225, 29, 72, 0.4)',
        'glow-screen': '0 10px 40px -10px rgba(56, 189, 248, 0.35)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0a0d14",
        surface: {
          50: "#111726",
          100: "#161e31",
          200: "#1e293b",
          300: "#334155",
          card: "#0f172a",
          cardElevated: "#182238",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(56, 189, 248, 0.35)",
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        brand: {
          blue: "#2563eb",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

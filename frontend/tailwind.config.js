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
        peach: {
          50: '#fff8f6',
          100: '#ffefe9',
          200: '#ffd9cb',
          300: '#ffb9a1',
          400: '#ff8c67',
          500: '#ff7043', // Primary vibrant peach
          600: '#f4511e',
          700: '#d83b01',
          800: '#b02a00',
          900: '#8c2400',
          glow: '#ff8a65',
        },
        dark: {
          bg: '#0a0d14',
          card: '#121722',
          border: '#1e2638',
          hover: '#1a2234',
          muted: '#808da4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-peach': '0 0 20px -3px rgba(255, 112, 67, 0.3)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}

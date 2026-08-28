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
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD2C2',
          300: '#FFB29A',
          400: '#FF8C69',
          500: '#F97352', // Primary Light Accent
          600: '#E25432',
          700: '#BD3B1B',
          800: '#9B3016',
          900: '#7E2A16',
        },
        leaf: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          400: '#48BB78',
          500: '#38A169', // Secondary Light Green
          600: '#2F855A',
          700: '#276749',
        },
        espresso: {
          800: '#26201E', // Dark mode card surface
          900: '#1A1615', // Dark mode main background
          950: '#120F0E',
        },
        cream: {
          50: '#FAFAF7', // Soft off-white light background
          100: '#F5F3ED',
          200: '#EBE7DF', // Warm card border
        }
      },
      fontFamily: {
        display: ['Outfit', 'Fredoka', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'peachy-bob': 'bob 3s ease-in-out infinite',
        'peachy-blink': 'blink 4s ease-in-out infinite',
        'peachy-wiggle': 'wiggle 0.5s ease-in-out infinite',
        'peachy-bounce': 'bounceSlow 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

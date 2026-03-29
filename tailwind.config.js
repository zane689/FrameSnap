/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'flash': 'flash 0.3s ease-out',
        'fly-in': 'flyIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '0' },
        },
        flyIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.5) translateY(-20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}

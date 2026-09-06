/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f8',
          100: '#d4e0ed',
          200: '#a9c1db',
          300: '#6f97c0',
          400: '#3d6fa3',
          500: '#1e4d80',
          600: '#163d68',
          700: '#0f2d4e',
          800: '#0b1f3a',
          900: '#071428',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(11, 31, 58, 0.18)',
        soft: '0 4px 20px rgba(11, 31, 58, 0.08)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        batik: {
          50: '#fdf8f0',
          100: '#f9edda',
          200: '#f2d7b0',
          300: '#e8bc7d',
          400: '#de9f4e',
          500: '#d4862e',
          600: '#b96a23',
          700: '#9a511f',
          800: '#7d421f',
          900: '#66381c',
          950: '#3a1c0d',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}

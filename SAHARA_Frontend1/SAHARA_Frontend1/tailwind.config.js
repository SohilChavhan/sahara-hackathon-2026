
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          plum: '#4A2035',
          blue: '#507C9B',
          rose: '#E58B8F',
          peach: '#F2A297',
          cream: '#FFFDF6',
          black: '#1B0D16',
          'light-pink': '#F5D6D8',
        }
      },
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

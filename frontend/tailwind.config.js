module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      width: {
        'screen-1/4': '25vw',
      },
      height: {
        'w-screen-1/4': '25vw'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

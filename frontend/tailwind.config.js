module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    textColor: {
      'light-black': '#707070',
      'dark-black': '#252517',
      '6178EE': '#6178EE'
    },
    extend: {
      width: {
        'screen-1/4': '25vw',
      },
      height: {
        'w-screen-1/4': '25vw'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

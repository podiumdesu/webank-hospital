module.exports = {
  mode: 'jit',
  purge: ['patient.html', './patient/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.625rem',
      },
      width: {
        'screen-1/4': '25vw',
      },
      height: {
        'w-screen-1/4': '25vw'
      },
      textColor: {
        'light-black': '#707070',
        'dark-black': '#252517',
        '6178EE': '#6178EE'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

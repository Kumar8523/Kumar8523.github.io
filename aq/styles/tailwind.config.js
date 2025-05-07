module.exports = {
  content: ["./*.html", "./products/*.json"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7fcdff',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },
        secondary: {
          light: '#b9f8ba',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        accent: {
          light: '#fda4af',
          DEFAULT: '#f43f5e',
          dark: '#be123c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

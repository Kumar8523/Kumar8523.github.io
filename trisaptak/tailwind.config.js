module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'sangeet-primary': '#6b21a8',
        'sangeet-secondary': '#a855f7',
        'sangeet-light': '#e9d5ff',
        'sangeet-dark': '#4c1d95',
        'tanpura-gold': '#d4a017',
        'tabla-brown': '#a16207',
      },
      fontFamily: {
        'bengali': ['"Hind Siliguri"', 'sans-serif'],
        'devanagari': ['"Poppins"', 'sans-serif'],
      },
      backgroundImage: {
        'musical-pattern': "url('/assets/images/raga-pattern.png')",
        'tanpura-texture': "url('/assets/images/tanpura-texture.jpg')",
      },
      boxShadow: {
        'musical': '0 4px 14px 0 rgba(107, 33, 168, 0.39)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

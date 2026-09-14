/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sb: {
          blue: '#75BDE0',
          blueDeep: '#4E9FC9',
          gold: '#F8D49B',
          peach: '#F8BC9B',
          coral: '#F89B9B',
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          text: '#2D2D2D',
          textSoft: '#6B7280',
          border: '#E9E9E9'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        card: '22px',
        hero: '28px'
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
        hover: '0 10px 30px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
};

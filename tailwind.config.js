// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'autumn': ['Lora', 'Georgia', 'serif'],
        'autumn-display': ['Crimson Text', 'serif'],
      },
      colors: {
        'autumn': {
          50: '#FFFBEB',   // Cream
          100: '#FEF3C7',  // Light cream
          200: '#FDE68A',  // Pale yellow
          300: '#FCD34D',  // Light gold
          400: '#FBBF24',  // Gold
          500: '#F59E0B',  // Amber
          600: '#D97706',  // Dark amber
          700: '#B45309',  // Bronze
          800: '#92400E',  // Dark bronze
          900: '#78350F',  // Deep brown
        },
        'warm-gray': {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        'cream': '#FEF7ED',
        'almond': '#FFEBCD',
        'beige': '#F5F5DC',
        'caramel': '#C68E17',
        'cinnamon': '#D2691E',
        'coffee': '#6F4E37',
      },
      backgroundImage: {
        'autumn-gradient': 'linear-gradient(135deg, #FEF7ED 0%, #FED7AA 25%, #FDBA74 50%, #FB923C 75%, #F97316 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
        'cozy-gradient': 'linear-gradient(to bottom, #FEF7ED, #FED7AA)',
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(251, 146, 60, 0.39)',
        'autumn': '0 10px 25px -5px rgba(217, 119, 6, 0.25), 0 4px 6px -2px rgba(217, 119, 6, 0.05)',
        'cozy': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(217, 119, 6, 0.1)',
        'inner-warm': 'inset 0 2px 4px 0 rgba(217, 119, 6, 0.06)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'leaf-fall': 'leafFall 8s linear infinite',
        'warm-pulse': 'warmPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        leafFall: {
          '0%': { 
            transform: 'translateY(-100vh) rotate(0deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateY(100vh) rotate(360deg)',
            opacity: '0'
          },
        },
        warmPulse: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.7)'
          },
          '50%': { 
            opacity: '.8',
            boxShadow: '0 0 0 10px rgba(251, 191, 36, 0)'
          },
        },
      },
    },
  },
  plugins: [],
}
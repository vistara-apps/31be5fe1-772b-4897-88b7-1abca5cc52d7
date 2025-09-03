/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(220 70% 95%)',
        accent: 'hsl(180 70% 45%)',
        primary: 'hsl(240 80% 50%)',
        surface: 'hsl(220 70% 98%)',
        'text-primary': 'hsl(210 20% 20%)',
        'text-secondary': 'hsl(210 20% 40%)',
        purple: {
          50: 'hsl(270 90% 98%)',
          100: 'hsl(270 85% 95%)',
          500: 'hsl(270 75% 60%)',
          600: 'hsl(270 75% 50%)',
          700: 'hsl(270 75% 40%)',
          900: 'hsl(270 75% 15%)',
        },
        blue: {
          50: 'hsl(220 90% 98%)',
          500: 'hsl(220 85% 60%)',
          600: 'hsl(220 85% 50%)',
        }
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
      boxShadow: {
        card: '0 2px 8px hsla(210, 20%, 10%, 0.08)',
      },
      spacing: {
        lg: '16px',
        md: '8px',
        sm: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 200ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

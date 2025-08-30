/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        // RAGAR Gaming Color Palette
        'dark-bg': '#0D1117',
        'card-bg': '#161B22',
        'border-gray': '#30363D',
        'neon-cyan': '#00FFFF',
        'neon-pink': '#FF00FF',
        'neon-green': '#00FF00',
        'gaming-purple': '#667eea',
        'gaming-orange': '#FF6B35',
        'gaming-blue': '#4F46E5',
        'ragar-primary': '#00FFFF',
        'ragar-secondary': '#FF00FF',
        'ragar-accent': '#00FF00',
        'ragar-warning': '#FF6B35',
        'ragar-danger': '#ff4757',
        'ragar-success': '#00FF00',
        
        // Shadcn/ui colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))"
        }
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'],
        'cyber': ['JetBrains Mono', 'Consolas', 'monospace'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)',
        'neon-gradient': 'linear-gradient(45deg, #00FFFF, #FF00FF)',
        'cyber-gradient': 'linear-gradient(90deg, #00FFFF 0%, #FF00FF 50%, #00FF00 100%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'loading-spinner': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          'from': { 
            textShadow: '0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF',
            boxShadow: '0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF',
          },
          'to': { 
            textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
            boxShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
          },
        },
        'glow': {
          'from': { 
            textShadow: '0 0 20px currentColor',
            filter: 'drop-shadow(0 0 20px currentColor)',
          },
          'to': { 
            textShadow: '0 0 30px currentColor, 0 0 40px currentColor',
            filter: 'drop-shadow(0 0 30px currentColor)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      boxShadow: {
        'neon': '0 0 5px currentColor, 0 0 20px currentColor, 0 0 35px currentColor',
        'neon-lg': '0 0 10px currentColor, 0 0 30px currentColor, 0 0 60px currentColor',
        'gaming': '0 4px 15px rgba(0, 255, 255, 0.3)',
        'gaming-lg': '0 8px 25px rgba(0, 255, 255, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.text-glow-lg': {
          textShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor',
        },
        '.neon-glow': {
          boxShadow: '0 0 5px currentColor, 0 0 20px currentColor, 0 0 35px currentColor',
        },
        '.neon-glow-lg': {
          boxShadow: '0 0 10px currentColor, 0 0 30px currentColor, 0 0 60px currentColor',
        },
        '.glass': {
          background: 'rgba(22, 27, 34, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(48, 54, 61, 0.5)',
        },
        '.glass-strong': {
          background: 'rgba(22, 27, 34, 0.9)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(48, 54, 61, 0.7)',
        },
        '.loading-spinner': {
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        },
      }
      addUtilities(newUtilities)
    },
    require("tailwindcss-animate")
  ],
} 
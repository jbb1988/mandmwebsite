import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mind & Muscle Brand Colors - Enhanced for Vibrancy
        'deep-orbit-navy': '#02124A',
        'neon-cortex-blue': '#0EA5E9', // Brighter cyan-blue
        'neon-cortex-red': '#EF4444', // Brighter red
        'neon-cortex-green': '#10B981', // Brighter green
        'solar-surge-orange': '#F97316', // Brighter orange
        'starlight-white': '#FFFFFF',
        'jet-black': '#0B0306',
        'text-primary': '#FFFFFF', // Pure white for better contrast
        'text-secondary': '#D1D5DB', // Brighter gray (was #B8B8B8)
        'card-background': '#1A2138',
        'card-background-darker': '#141B2F',
        'divider': '#2A3148',

        // Mind Training Colors - Brighter
        'mind-primary': '#06B6D4', // Brighter cyan
        'mind-secondary': '#0284C7',
        'mind-accent': '#67E8F9',

        // Muscle Training Colors - Brighter
        'muscle-primary': '#F97316', // Brighter orange
        'muscle-secondary': '#EA580C',
        'muscle-accent': '#FB923C',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'liquid': '40px',
        'liquid-strong': '60px',
      },
      backgroundImage: {
        'liquid-gradient-blue': 'linear-gradient(135deg, rgba(12, 106, 211, 0.15) 0%, rgba(0, 163, 255, 0.08) 100%)',
        'liquid-gradient-orange': 'linear-gradient(135deg, rgba(198, 119, 26, 0.15) 0%, rgba(255, 107, 0, 0.08) 100%)',
        'radial-glow-blue': 'radial-gradient(circle at 50% 50%, rgba(12, 106, 211, 0.15) 0%, transparent 70%)',
        'radial-glow-orange': 'radial-gradient(circle at 50% 50%, rgba(198, 119, 26, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'liquid': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'liquid-glow-blue': '0 8px 32px 0 rgba(14, 165, 233, 0.4), 0 0 80px 0 rgba(14, 165, 233, 0.25)',
        'liquid-glow-orange': '0 8px 32px 0 rgba(249, 115, 22, 0.4), 0 0 80px 0 rgba(249, 115, 22, 0.25)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

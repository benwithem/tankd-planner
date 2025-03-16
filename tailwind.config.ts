import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        swim: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(10deg) translateX(20px)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(-10deg) translateX(-20px)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
        },
        'swim-reverse': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(-10deg) translateX(-20px) scaleX(-1)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(10deg) translateX(20px) scaleX(-1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
        },
        'swim-fast': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(15deg) translateX(30px)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(-15deg) translateX(-30px)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
        },
        'swim-fast-reverse': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(-15deg) translateX(-30px) scaleX(-1)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(15deg) translateX(30px) scaleX(-1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
        },
        'swim-slow': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(5deg) translateX(15px)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(-5deg) translateX(-15px)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0)' },
        },
        'swim-slow-reverse': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
          '25%': { transform: 'translate(-50%, -50%) rotate(-5deg) translateX(-15px) scaleX(-1)' },
          '75%': { transform: 'translate(-50%, -50%) rotate(5deg) translateX(15px) scaleX(-1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(0) scaleX(-1)' },
        },
        bubble: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translateY(-100px) scale(1.2)', opacity: '0.6' },
          '100%': { transform: 'translateY(-200px) scale(0.8)', opacity: '0' },
        },
        sway: {
          '0%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
          '100%': { transform: 'rotate(-5deg)' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        'swim': 'swim 20s ease-in-out infinite',
        'swim-reverse': 'swim-reverse 20s ease-in-out infinite',
        'swim-fast': 'swim-fast 15s ease-in-out infinite',
        'swim-fast-reverse': 'swim-fast-reverse 15s ease-in-out infinite',
        'swim-slow': 'swim-slow 30s ease-in-out infinite',
        'swim-slow-reverse': 'swim-slow-reverse 30s ease-in-out infinite',
        'bubble': 'bubble 3s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

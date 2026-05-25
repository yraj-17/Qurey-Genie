import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Query Genie Brand Colors
				brand: {
					50: 'hsl(var(--brand-50))',
					100: 'hsl(var(--brand-100))',
					200: 'hsl(var(--brand-200))',
					300: 'hsl(var(--brand-300))',
					400: 'hsl(var(--brand-400))',
					500: 'hsl(var(--brand-500))',
					600: 'hsl(var(--brand-600))',
					700: 'hsl(var(--brand-700))',
					800: 'hsl(var(--brand-800))',
					900: 'hsl(var(--brand-900))',
				},
				ink: {
					950: '#070510',
					900: '#0a0814',
					800: '#11091f',
					700: '#1a0f2e',
				},
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					elevated: 'hsl(var(--surface-elevated))',
					overlay: 'hsl(var(--surface-overlay))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'pulse-brand': {
					'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--brand-500) / 0.7)' },
					'70%': { boxShadow: '0 0 0 10px hsl(var(--brand-500) / 0)' }
				},
				'gradient-x': {
					'0%, 100%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				'glow-pulse': {
					'0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
				},
				shimmer: {
					'0%': { 'background-position': '-200% 0' },
					'100%': { 'background-position': '200% 0' },
				},
				'caret-blink': {
					'0%, 70%, 100%': { opacity: '1' },
					'20%, 50%': { opacity: '0' },
				},
				orbit: {
					'0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
					'100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-brand': 'pulse-brand 2s infinite',
				'gradient-x': 'gradient-x 8s ease infinite',
				float: 'float 6s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				shimmer: 'shimmer 2.5s linear infinite',
				'caret-blink': 'caret-blink 1s steps(1) infinite',
				orbit: 'orbit 20s linear infinite',
			},
			backgroundImage: {
				'grid-pattern':
					'linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)',
				'radial-glow':
					'radial-gradient(circle at center, rgba(139,92,246,0.25) 0%, transparent 70%)',
			},
			backgroundSize: {
				grid: '60px 60px',
			},
			backdropBlur: {
				xs: '2px',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Menlo', 'monospace'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;











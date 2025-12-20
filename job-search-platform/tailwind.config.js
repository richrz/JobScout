/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		'./src/pages/**/*.{ts,tsx}',
		'./src/components/**/*.{ts,tsx}',
		'./src/app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
    	extend: {
    		fontFamily: {
    			sans: [
    				'var(--font-jakarta)',
    				'var(--font-geist-sans)',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			mono: [
    				'var(--font-geist-mono)',
    				'ui-monospace',
    				'monospace'
    			]
    		},
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
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontSize: {
    			'title-page': [
    				'2.25rem',
    				{
    					lineHeight: '2.5rem',
    					letterSpacing: '-0.02em',
    					fontWeight: '700'
    				}
    			],
    			'title-section': [
    				'1.5rem',
    				{
    					lineHeight: '2rem',
    					letterSpacing: '-0.01em',
    					fontWeight: '600'
    				}
    			],
    			'title-subsection': [
    				'1.25rem',
    				{
    					lineHeight: '1.75rem',
    					fontWeight: '600'
    				}
    			],
    			body: [
    				'1rem',
    				{
    					lineHeight: '1.5rem',
    					fontWeight: '400'
    				}
    			],
    			'body-sm': [
    				'0.875rem',
    				{
    					lineHeight: '1.25rem',
    					fontWeight: '400'
    				}
    			],
    			tiny: [
    				'0.75rem',
    				{
    					lineHeight: '1rem',
    					fontWeight: '500'
    				}
    			]
    		},
    		spacing: {
    			page: '2rem',
    			section: '3rem',
    			card: '1.5rem'
    		},
    		boxShadow: {
    			card: '0 0 0 1px hsla(var(--border), 0.5), 0 2px 8px hsla(0, 0%, 0%, 0.05)',
    			'card-hover': '0 0 0 1px hsla(var(--primary), 0.2), 0 8px 16px hsla(0, 0%, 0%, 0.1)',
    			popover: '0 0 0 1px hsla(var(--border), 0.5), 0 4px 20px hsla(0, 0%, 0%, 0.15)',
    			glow: '0 0 15px hsla(var(--primary), 0.3)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0)'
    				},
    				'50%': {
    					transform: 'translateY(-5px)'
    				}
    			},
    			'pulse-glow': {
    				'0%, 100%': {
    					boxShadow: '0 0 0 0px hsla(var(--primary), 0.4)'
    				},
    				'50%': {
    					boxShadow: '0 0 0 8px hsla(var(--primary), 0)'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			float: 'float 3s ease-in-out infinite',
    			'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}

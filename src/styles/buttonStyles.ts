/**
 * Glassmorphic Button Style Constants
 * Based on the Flutter glassmorphic_button.dart design
 */

export const glassmorphicButtonStyles = {
  // Primary button (blue theme)
  primary: `
    px-6 py-3 rounded-lg font-semibold backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-neon-cortex-blue/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10
    hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Secondary button (orange theme)
  secondary: `
    px-6 py-3 rounded-lg font-semibold backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-solar-surge-orange/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-solar-surge-orange/10
    hover:shadow-liquid-glow-orange hover:border-solar-surge-orange/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Large primary button
  primaryLarge: `
    px-12 py-5 text-lg rounded-2xl font-semibold font-poppins backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-neon-cortex-blue/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10
    hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Large secondary button
  secondaryLarge: `
    px-12 py-5 text-lg rounded-2xl font-semibold font-poppins backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-solar-surge-orange/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-solar-surge-orange/10
    hover:shadow-liquid-glow-orange hover:border-solar-surge-orange/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Outlined button (transparent with border)
  outlined: `
    px-6 py-3 rounded-lg font-semibold backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border-2 border-neon-cortex-blue/40
    bg-transparent hover:bg-neon-cortex-blue/10
    hover:border-neon-cortex-blue/60
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Text button (minimal styling)
  text: `
    px-4 py-2 rounded-lg font-semibold
    transition-all duration-300 hover:scale-105 active:scale-95
    bg-white/5 hover:bg-white/10
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Compact button (smaller size)
  compact: `
    px-4 py-2 text-sm rounded-lg font-semibold backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-neon-cortex-blue/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10
    hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,

  // Destructive button (red theme)
  destructive: `
    px-6 py-3 rounded-lg font-semibold backdrop-blur-md
    transition-all duration-300 hover:scale-105 active:scale-95
    border border-red-500/30
    bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-red-500/10
    hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:border-red-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `,
};

/**
 * Helper function to get glassmorphic button class names
 * @param variant Button variant
 * @param className Additional class names
 * @returns Combined class names
 */
export function getGlassmorphicButton(
  variant: keyof typeof glassmorphicButtonStyles = 'primary',
  className?: string
): string {
  return `${glassmorphicButtonStyles[variant]} ${className || ''}`.trim();
}

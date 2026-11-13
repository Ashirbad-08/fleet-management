import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-accent text-black font-bold hover:bg-green shadow-xs',
  accent: 'bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25',
  secondary: 'bg-panel-2 border border-line text-lo hover:text-hi hover:bg-hover',
  danger: 'bg-red/15 text-red border border-red/30 hover:bg-red/25',
  ghost: 'text-dim hover:text-hi hover:bg-hover border-transparent',
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      data-component="Button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.secondary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

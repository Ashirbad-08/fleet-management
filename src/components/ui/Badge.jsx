import { cn } from '../../utils/cn'

const badgeVariants = {
  success: 'bg-green/15 text-green border-green/30',
  warning: 'bg-amber/15 text-amber border-amber/30',
  critical: 'bg-red/15 text-red border-red/30',
  info: 'bg-accent/15 text-accent border-accent/30',
  neutral: 'bg-panel-2 text-dim border-line-soft',
}

export function Badge({ variant = 'neutral', className = '', children, ...props }) {
  return (
    <span
      data-component="Badge"
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border',
        badgeVariants[variant] || badgeVariants.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge

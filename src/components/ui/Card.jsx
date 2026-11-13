import { cn } from '../../utils/cn'

export function Card({ className = '', children, ...props }) {
  return (
    <div
      data-component="Card"
      className={cn('rounded-xl border border-line bg-panel p-4 shadow-2xs', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

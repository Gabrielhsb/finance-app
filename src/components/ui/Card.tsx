import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-surface-card rounded-xl border border-border p-5', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-xs font-medium text-text-tertiary mb-1', className)}>
      {children}
    </h3>
  )
}

export function CardValue({ children, className }: CardProps) {
  return (
    <p className={cn('text-2xl font-semibold text-text-primary', className)}>
      {children}
    </p>
  )
}

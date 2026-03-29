import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400 mb-1', className)}>
      {children}
    </h3>
  )
}

export function CardValue({ children, className }: CardProps) {
  return (
    <p className={cn('text-2xl font-bold text-gray-900 dark:text-white', className)}>
      {children}
    </p>
  )
}

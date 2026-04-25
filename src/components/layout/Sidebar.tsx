'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Tag,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cartoes', label: 'Cartões', icon: CreditCard },
  { href: '/receitas', label: 'Receitas', icon: TrendingUp },
  { href: '/despesas', label: 'Despesas', icon: TrendingDown },
  { href: '/parcelas', label: 'Parcelas', icon: Layers },
  { href: '/categorias', label: 'Categorias', icon: Tag },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-card border-r border-border min-h-screen">
      <div className="h-14 px-5 flex items-center border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold leading-none tracking-wider">F</span>
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Finança</span>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-brand-600 dark:text-brand-400' : 'text-text-tertiary'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

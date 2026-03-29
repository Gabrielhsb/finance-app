import { cn, formatCurrency } from '@/lib/utils'

interface BarraOrcamentoProps {
  saldo: number
  totalReceitas: number
  percentualGasto: number
}

export function BarraOrcamento({ saldo, totalReceitas, percentualGasto }: BarraOrcamentoProps) {
  const pct = Math.min(percentualGasto, 100)
  const cor =
    pct < 50 ? 'bg-emerald-500' :
    pct < 80 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Disponível para gastar</span>
        <span className={cn('font-semibold', saldo >= 0 ? 'text-emerald-600' : 'text-red-600')}>
          {formatCurrency(saldo)}
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', cor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{pct.toFixed(0)}% do orçamento usado</span>
        <span>Total: {formatCurrency(totalReceitas)}</span>
      </div>
    </div>
  )
}

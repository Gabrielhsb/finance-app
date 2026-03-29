'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '@/lib/utils'

interface SeletorMesProps {
  mes: number
  ano: number
  onChange: (mes: number, ano: number) => void
}

export function SeletorMes({ mes, ano, onChange }: SeletorMesProps) {
  function anterior() {
    if (mes === 1) onChange(12, ano - 1)
    else onChange(mes - 1, ano)
  }

  function proximo() {
    if (mes === 12) onChange(1, ano + 1)
    else onChange(mes + 1, ano)
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={anterior} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize min-w-32 text-center">
        {formatMonth(mes, ano)}
      </span>
      <button onClick={proximo} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

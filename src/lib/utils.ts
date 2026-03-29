export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatMonth(mes: number, ano: number): string {
  const date = new Date(ano, mes - 1, 1)
  const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getCurrentMonth(): { mes: number; ano: number } {
  const now = new Date()
  return { mes: now.getMonth() + 1, ano: now.getFullYear() }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

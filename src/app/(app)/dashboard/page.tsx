'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardTitle, CardValue } from '@/components/ui/Card'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { GraficoRosca } from '@/components/charts/GraficoRosca'
import { GraficoBarra } from '@/components/charts/GraficoBarra'
import { BarraOrcamento } from '@/components/dashboard/BarraOrcamento'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { TrendingUp, TrendingDown, CreditCard } from 'lucide-react'

interface DashboardData {
  totalReceitas: number
  totalDespesas: number
  totalDespesasFixas: number
  totalDespesasVariaveis: number
  totalFaturas: number
  saldo: number
  percentualGasto: number
  porCategoria: { nome: string; cor: string; icone: string; valor: number }[]
  evolucao: { mes: number; ano: number; receitas: number; despesas: number }[]
}

export default function DashboardPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [data, setData] = useState<DashboardData | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/dashboard?mes=${mes}&ano=${ano}`)
    const json = await res.json()
    setData(json)
  }, [mes, ano])

  useEffect(() => { fetchData() }, [fetchData])

  const loading = data === null
  const saldo = data?.saldo ?? 0
  const saldoPositivo = saldo >= 0

  return (
    <>
      <Header title="Dashboard">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </Header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Linha 1: Saldo em destaque + Receitas/Despesas/Cartões */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Saldo — protagonista */}
          <Card className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <CardTitle>Saldo disponível</CardTitle>
              {loading ? (
                <div className="h-10 w-40 rounded-lg bg-surface-hover animate-pulse mt-1" />
              ) : (
                <CardValue className={`text-4xl tabular ${saldoPositivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {formatCurrency(saldo)}
                </CardValue>
              )}
            </div>
            <BarraOrcamento
              saldo={saldo}
              totalReceitas={data?.totalReceitas ?? 0}
              percentualGasto={data?.percentualGasto ?? 0}
            />
          </Card>

          {/* Receitas + Despesas + Cartões */}
          <div className="flex flex-col gap-4">
            <Card className="flex items-center justify-between">
              <div>
                <CardTitle>Receitas</CardTitle>
                {loading ? (
                  <div className="h-7 w-28 rounded bg-surface-hover animate-pulse mt-1" />
                ) : (
                  <CardValue className="text-emerald-600 dark:text-emerald-400 tabular">
                    {formatCurrency(data?.totalReceitas ?? 0)}
                  </CardValue>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500 opacity-30 shrink-0" />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <CardTitle>Despesas</CardTitle>
                  {loading ? (
                    <div className="h-7 w-28 rounded bg-surface-hover animate-pulse mt-1" />
                  ) : (
                    <CardValue className="text-red-500 tabular">
                      {formatCurrency(data?.totalDespesas ?? 0)}
                    </CardValue>
                  )}
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 opacity-30 shrink-0" />
              </div>
              <div className="flex gap-4 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">Fixas</p>
                  <p className="text-sm font-semibold tabular">{formatCurrency(data?.totalDespesasFixas ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">Variáveis</p>
                  <p className="text-sm font-semibold tabular">{formatCurrency(data?.totalDespesasVariaveis ?? 0)}</p>
                </div>
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <CardTitle>Cartões</CardTitle>
                {loading ? (
                  <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mt-1" />
                ) : (
                  <CardValue className="text-brand-600 dark:text-brand-400 tabular">
                    {formatCurrency(data?.totalFaturas ?? 0)}
                  </CardValue>
                )}
                <p className="text-xs text-text-tertiary mt-0.5">Faturas do mês</p>
              </div>
              <CreditCard className="w-8 h-8 text-brand-500 opacity-30 shrink-0" />
            </Card>
          </div>
        </div>

        {/* Linha 2: Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardTitle>Gastos por categoria</CardTitle>
            <GraficoRosca data={data?.porCategoria ?? []} />
          </Card>
          <Card>
            <CardTitle>Evolução — últimos 6 meses</CardTitle>
            <GraficoBarra data={data?.evolucao ?? []} />
          </Card>
        </div>
      </div>
    </>
  )
}

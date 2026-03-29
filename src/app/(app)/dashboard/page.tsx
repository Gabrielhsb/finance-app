'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardTitle, CardValue } from '@/components/ui/Card'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { GraficoRosca } from '@/components/charts/GraficoRosca'
import { GraficoBarra } from '@/components/charts/GraficoBarra'
import { BarraOrcamento } from '@/components/dashboard/BarraOrcamento'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react'

interface DashboardData {
  totalReceitas: number
  totalDespesas: number
  totalDespesasFixas: number
  totalDespesasVariaveis: number
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

  function handleMes(m: number, a: number) {
    setMes(m)
    setAno(a)
  }

  return (
    <>
      <Header title="Dashboard">
        <SeletorMes mes={mes} ano={ano} onChange={handleMes} />
      </Header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardTitle>Receitas</CardTitle>
            <CardValue className="text-emerald-600">{formatCurrency(data?.totalReceitas ?? 0)}</CardValue>
            <TrendingUp className="w-4 h-4 text-emerald-500 mt-1" />
          </Card>
          <Card>
            <CardTitle>Despesas</CardTitle>
            <CardValue className="text-red-500">{formatCurrency(data?.totalDespesas ?? 0)}</CardValue>
            <TrendingDown className="w-4 h-4 text-red-500 mt-1" />
          </Card>
          <Card>
            <CardTitle>Saldo</CardTitle>
            <CardValue className={(data?.saldo ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}>
              {formatCurrency(data?.saldo ?? 0)}
            </CardValue>
            <Wallet className="w-4 h-4 text-indigo-500 mt-1" />
          </Card>
          <Card>
            <CardTitle>Fixas / Variáveis</CardTitle>
            <CardValue className="text-sm">
              {formatCurrency(data?.totalDespesasFixas ?? 0)} / {formatCurrency(data?.totalDespesasVariaveis ?? 0)}
            </CardValue>
            <PieChart className="w-4 h-4 text-amber-500 mt-1" />
          </Card>
        </div>

        {/* Barra de orçamento */}
        <Card>
          <BarraOrcamento
            saldo={data?.saldo ?? 0}
            totalReceitas={data?.totalReceitas ?? 0}
            percentualGasto={data?.percentualGasto ?? 0}
          />
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardTitle>Gastos por Categoria</CardTitle>
            <GraficoRosca data={data?.porCategoria ?? []} />
          </Card>
          <Card>
            <CardTitle>Evolução dos Últimos 6 Meses</CardTitle>
            <GraficoBarra data={data?.evolucao ?? []} />
          </Card>
        </div>
      </div>
    </>
  )
}

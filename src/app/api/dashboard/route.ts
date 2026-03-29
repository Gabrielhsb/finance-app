import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes'))
  const ano = Number(searchParams.get('ano'))

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 1)

  const [receitasFixas, receitasVariaveis, despesasFixas, despesasVariaveis] = await Promise.all([
    prisma.receitaFixa.findMany({ where: { ativo: true } }),
    prisma.receitaVariavel.findMany({ where: { data: { gte: inicio, lt: fim } } }),
    prisma.despesaFixa.findMany({ where: { ativo: true }, include: { categoria: true } }),
    prisma.despesaVariavel.findMany({
      where: { data: { gte: inicio, lt: fim } },
      include: { categoria: true },
    }),
  ])

  const totalReceitas =
    receitasFixas.reduce((s, r) => s + r.valor, 0) +
    receitasVariaveis.reduce((s, r) => s + r.valor, 0)

  const totalDespesasFixas = despesasFixas.reduce((s, d) => s + d.valor, 0)
  const totalDespesasVariaveis = despesasVariaveis.reduce((s, d) => s + d.valor, 0)
  const totalDespesas = totalDespesasFixas + totalDespesasVariaveis
  const saldo = totalReceitas - totalDespesas

  // Gastos por categoria
  const porCategoria: Record<string, { nome: string; cor: string; icone: string; valor: number }> = {}

  for (const d of [...despesasFixas, ...despesasVariaveis]) {
    const catId = d.categoriaId
    if (!porCategoria[catId]) {
      porCategoria[catId] = { nome: d.categoria.nome, cor: d.categoria.cor, icone: d.categoria.icone, valor: 0 }
    }
    porCategoria[catId].valor += d.valor
  }

  // Evolução últimos 6 meses
  const evolucao = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1)
    const m = d.getMonth() + 1
    const a = d.getFullYear()
    const ini = new Date(a, m - 1, 1)
    const fim2 = new Date(a, m, 1)

    const [rv, dv, rf, df] = await Promise.all([
      prisma.receitaVariavel.aggregate({ where: { data: { gte: ini, lt: fim2 } }, _sum: { valor: true } }),
      prisma.despesaVariavel.aggregate({ where: { data: { gte: ini, lt: fim2 } }, _sum: { valor: true } }),
      prisma.receitaFixa.findMany({ where: { ativo: true } }),
      prisma.despesaFixa.findMany({ where: { ativo: true } }),
    ])

    evolucao.push({
      mes: m,
      ano: a,
      receitas: (rv._sum.valor ?? 0) + rf.reduce((s, r) => s + r.valor, 0),
      despesas: (dv._sum.valor ?? 0) + df.reduce((s, d) => s + d.valor, 0),
    })
  }

  return NextResponse.json({
    totalReceitas,
    totalDespesas,
    totalDespesasFixas,
    totalDespesasVariaveis,
    saldo,
    percentualGasto: totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0,
    porCategoria: Object.values(porCategoria),
    evolucao,
  })
}

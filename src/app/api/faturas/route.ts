import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cartaoId = searchParams.get('cartaoId')
  const mes = Number(searchParams.get('mes'))
  const ano = Number(searchParams.get('ano'))

  const where: Record<string, unknown> = {}
  if (cartaoId) where.cartaoId = cartaoId
  if (mes) where.mes = mes
  if (ano) where.ano = ano

  const faturas = await prisma.faturaCartao.findMany({ where, include: { cartao: true } })
  return NextResponse.json(faturas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { cartaoId, mes, ano, valor } = body

  if (!cartaoId || !mes || !ano || valor === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const fatura = await prisma.faturaCartao.upsert({
    where: { cartaoId_mes_ano: { cartaoId, mes, ano } },
    update: { valor },
    create: { cartaoId, mes, ano, valor },
  })
  return NextResponse.json(fatura, { status: 201 })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes'))
  const ano = Number(searchParams.get('ano'))
  const categoriaId = searchParams.get('categoriaId')

  const where: Record<string, unknown> = {
    data: {
      gte: new Date(ano, mes - 1, 1),
      lt: new Date(ano, mes, 1),
    },
  }
  if (categoriaId) where.categoriaId = categoriaId

  const despesas = await prisma.despesaVariavel.findMany({
    where,
    include: { categoria: true, cartao: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(despesas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { descricao, valor, data, categoriaId, cartaoId } = body

  if (!descricao || valor === undefined || !data || !categoriaId) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const despesa = await prisma.despesaVariavel.create({
    data: {
      descricao,
      valor,
      data: new Date(data),
      categoriaId,
      cartaoId: cartaoId || null,
    },
    include: { categoria: true, cartao: true },
  })
  return NextResponse.json(despesa, { status: 201 })
}

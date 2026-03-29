import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes'))
  const ano = Number(searchParams.get('ano'))

  const receitas = await prisma.receitaVariavel.findMany({
    where: {
      data: {
        gte: new Date(ano, mes - 1, 1),
        lt: new Date(ano, mes, 1),
      },
    },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(receitas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { descricao, valor, data } = body

  if (!descricao || valor === undefined || !data) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const receita = await prisma.receitaVariavel.create({
    data: { descricao, valor, data: new Date(data) },
  })
  return NextResponse.json(receita, { status: 201 })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const receitas = await prisma.receitaFixa.findMany({
    where: { ativo: true },
    orderBy: { descricao: 'asc' },
  })
  return NextResponse.json(receitas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { descricao, valor, diaDoMes } = body

  if (!descricao || valor === undefined || !diaDoMes) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const receita = await prisma.receitaFixa.create({ data: { descricao, valor, diaDoMes } })
  return NextResponse.json(receita, { status: 201 })
}

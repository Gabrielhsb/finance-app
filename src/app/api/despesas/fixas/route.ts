import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const despesas = await prisma.despesaFixa.findMany({
    where: { ativo: true },
    include: { categoria: true, cartao: true },
    orderBy: { descricao: 'asc' },
  })
  return NextResponse.json(despesas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { descricao, valor, diaDoMes, categoriaId, cartaoId } = body

  if (!descricao || valor === undefined || !diaDoMes || !categoriaId) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const despesa = await prisma.despesaFixa.create({
    data: { descricao, valor, diaDoMes, categoriaId, cartaoId: cartaoId || null },
    include: { categoria: true, cartao: true },
  })
  return NextResponse.json(despesa, { status: 201 })
}

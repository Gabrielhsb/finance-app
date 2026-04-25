import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes')) || null
  const ano = Number(searchParams.get('ano')) || null

  const cartoes = await prisma.cartao.findMany({
    orderBy: { nome: 'asc' },
    include: {
      faturas: mes && ano
        ? { where: { mes, ano } }
        : { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json(cartoes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { nome, bandeira, cor } = body

  if (!nome || !bandeira || !cor) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const cartao = await prisma.cartao.create({ data: { nome, bandeira, cor } })
  return NextResponse.json(cartao, { status: 201 })
}

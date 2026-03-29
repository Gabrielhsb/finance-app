import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cartoes = await prisma.cartao.findMany({
    orderBy: { nome: 'asc' },
    include: { faturas: { orderBy: { createdAt: 'desc' }, take: 1 } },
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

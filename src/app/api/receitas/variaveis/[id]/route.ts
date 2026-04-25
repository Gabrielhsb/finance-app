import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { descricao, valor, data } = body
  const receita = await prisma.receitaVariavel.update({
    where: { id },
    data: { descricao, valor, data: new Date(data) },
  })
  return NextResponse.json(receita)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.receitaVariavel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

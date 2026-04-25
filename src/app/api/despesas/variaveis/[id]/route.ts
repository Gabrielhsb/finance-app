import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { descricao, valor, data, categoriaId, cartaoId } = body
  const despesa = await prisma.despesaVariavel.update({
    where: { id },
    data: { descricao, valor, data: new Date(data), categoriaId, cartaoId: cartaoId || null },
    include: { categoria: true, cartao: true },
  })
  return NextResponse.json(despesa)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.despesaVariavel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

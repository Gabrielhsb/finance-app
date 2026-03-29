import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { descricao, valor, diaDoMes, categoriaId, cartaoId } = body
  const despesa = await prisma.despesaFixa.update({
    where: { id },
    data: { descricao, valor, diaDoMes, categoriaId, cartaoId: cartaoId || null },
    include: { categoria: true, cartao: true },
  })
  return NextResponse.json(despesa)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.despesaFixa.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { descricao, valorParcela, totalParcelas, mesInicio, anoInicio, cartaoId, categoriaId } = await request.json()
  const parcela = await prisma.compraParcelada.update({
    where: { id },
    data: { descricao, valorParcela, totalParcelas, mesInicio, anoInicio, cartaoId: cartaoId || null, categoriaId: categoriaId || null },
    include: { cartao: true, categoria: true },
  })
  return NextResponse.json(parcela)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.compraParcelada.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

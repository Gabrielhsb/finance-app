import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const parcelas = await prisma.compraParcelada.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      cartao: { select: { id: true, nome: true, cor: true } },
      categoria: { select: { id: true, nome: true, cor: true, icone: true } },
    },
  })
  return NextResponse.json(parcelas)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { descricao, valorParcela, totalParcelas, mesInicio, anoInicio, cartaoId, categoriaId } = body

  if (!descricao || !valorParcela || !totalParcelas || !mesInicio || !anoInicio) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const parcela = await prisma.compraParcelada.create({
    data: {
      descricao,
      valorParcela: Number(valorParcela),
      totalParcelas: Number(totalParcelas),
      mesInicio: Number(mesInicio),
      anoInicio: Number(anoInicio),
      cartaoId: cartaoId || null,
      categoriaId: categoriaId || null,
    },
    include: {
      cartao: { select: { id: true, nome: true, cor: true } },
      categoria: { select: { id: true, nome: true, cor: true, icone: true } },
    },
  })

  return NextResponse.json(parcela, { status: 201 })
}

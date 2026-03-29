import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categorias = await prisma.categoria.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(categorias)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { nome, cor, icone } = body

  if (!nome || !cor || !icone) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const categoria = await prisma.categoria.create({ data: { nome, cor, icone } })
  return NextResponse.json(categoria, { status: 201 })
}

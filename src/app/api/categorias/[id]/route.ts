import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { nome, cor, icone } = body

  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nome, cor, icone },
  })
  return NextResponse.json(categoria)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.categoria.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

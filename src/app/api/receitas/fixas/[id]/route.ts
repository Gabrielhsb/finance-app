import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const receita = await prisma.receitaFixa.update({ where: { id }, data: body })
  return NextResponse.json(receita)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.receitaFixa.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  const categorias = [
    { nome: 'Moradia', cor: '#6366f1', icone: 'home' },
    { nome: 'Alimentação', cor: '#f59e0b', icone: 'utensils' },
    { nome: 'Transporte', cor: '#3b82f6', icone: 'car' },
    { nome: 'Saúde', cor: '#10b981', icone: 'heart-pulse' },
    { nome: 'Lazer', cor: '#ec4899', icone: 'gamepad-2' },
    { nome: 'Outros', cor: '#6b7280', icone: 'circle-ellipsis' },
  ]

  for (const cat of categorias) {
    const exists = await prisma.categoria.findFirst({ where: { nome: cat.nome } })
    if (!exists) {
      await prisma.categoria.create({ data: cat })
    }
  }
  console.log('Seed concluído')
}

main().catch(console.error).finally(() => prisma.$disconnect())

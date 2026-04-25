import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Categorias
  const categorias = [
    { nome: 'Moradia', cor: '#6366f1', icone: 'home' },
    { nome: 'Alimentação', cor: '#f59e0b', icone: 'utensils' },
    { nome: 'Transporte', cor: '#3b82f6', icone: 'car' },
    { nome: 'Saúde', cor: '#10b981', icone: 'heart-pulse' },
    { nome: 'Lazer', cor: '#ec4899', icone: 'gamepad-2' },
    { nome: 'Outros', cor: '#6b7280', icone: 'circle-ellipsis' },
    { nome: 'Assinaturas', cor: '#8b5cf6', icone: 'credit-card' },
    { nome: 'Financiamento', cor: '#ef4444', icone: 'landmark' },
    { nome: 'Impostos', cor: '#f97316', icone: 'receipt' },
  ]

  for (const cat of categorias) {
    const exists = await prisma.categoria.findFirst({ where: { nome: cat.nome } })
    if (!exists) {
      await prisma.categoria.create({ data: cat })
    }
  }

  const getCat = async (nome: string) => {
    const cat = await prisma.categoria.findFirst({ where: { nome } })
    if (!cat) throw new Error(`Categoria não encontrada: ${nome}`)
    return cat.id
  }

  // Cartões
  const cartoes = [
    { nome: 'Nubank', bandeira: 'Mastercard', cor: '#820ad1' },
    { nome: 'Bradesco', bandeira: 'Visa', cor: '#cc0000' },
    { nome: 'Amazon', bandeira: 'Mastercard', cor: '#ff9900' },
    { nome: 'Itaú', bandeira: 'Mastercard', cor: '#ec7000' },
    { nome: 'Renner', bandeira: 'Mastercard', cor: '#e30613' },
  ]

  for (const cartao of cartoes) {
    const exists = await prisma.cartao.findFirst({ where: { nome: cartao.nome } })
    if (!exists) {
      await prisma.cartao.create({ data: cartao })
    }
  }

  const getCartao = async (nome: string) => {
    const c = await prisma.cartao.findFirst({ where: { nome } })
    if (!c) throw new Error(`Cartão não encontrado: ${nome}`)
    return c.id
  }

  // Receitas Fixas
  const receitasFixas = [
    { descricao: 'Salário', valor: 4920, diaDoMes: 5 },
    { descricao: 'Mãe', valor: 490, diaDoMes: 10 },
    { descricao: 'Pai', valor: 120, diaDoMes: 10 },
    { descricao: 'Thaty', valor: 362, diaDoMes: 10 },
    { descricao: 'Cesar + Gabs', valor: 87, diaDoMes: 10 },
    { descricao: 'Apple One (repasse)', valor: 83, diaDoMes: 11 },
    { descricao: 'Kotas (repasse)', valor: 220, diaDoMes: 10 },
    { descricao: 'Sp + YT (repasse)', valor: 54, diaDoMes: 10 },
    { descricao: 'Academia (repasse)', valor: 100, diaDoMes: 10 },
  ]

  for (const r of receitasFixas) {
    const exists = await prisma.receitaFixa.findFirst({ where: { descricao: r.descricao } })
    if (!exists) {
      await prisma.receitaFixa.create({ data: r })
    }
  }

  // Receitas Variáveis (valores de março 2026 como base)
  const receitasVariaveis = [
    { descricao: 'Criss', valor: 912, data: new Date('2026-03-10') },
    { descricao: 'Caixinha', valor: 850, data: new Date('2026-03-10') },
  ]

  for (const r of receitasVariaveis) {
    const exists = await prisma.receitaVariavel.findFirst({ where: { descricao: r.descricao, data: r.data } })
    if (!exists) {
      await prisma.receitaVariavel.create({ data: r })
    }
  }

  // Despesas Fixas
  const moradiaId = await getCat('Moradia')
  const outrosId = await getCat('Outros')
  const assinaturasId = await getCat('Assinaturas')
  const financiamentoId = await getCat('Financiamento')
  const saudeId = await getCat('Saúde')
  const lazerId = await getCat('Lazer')
  const impostosId = await getCat('Impostos')

  const nubankId = await getCartao('Nubank')
  const bradescoId = await getCartao('Bradesco')
  const amazonId = await getCartao('Amazon')
  const itauId = await getCartao('Itaú')
  const rennerId = await getCartao('Renner')

  const despesasFixas = [
    { descricao: 'Casa (aluguel)', valor: 1175, diaDoMes: 5, categoriaId: moradiaId },
    { descricao: 'Condomínio', valor: 260, diaDoMes: 10, categoriaId: moradiaId },
    { descricao: 'Aparelho (financiamento)', valor: 277, diaDoMes: 10, categoriaId: financiamentoId },
    { descricao: 'Seguro', valor: 185, diaDoMes: 10, categoriaId: moradiaId },
    { descricao: 'IPTU', valor: 32, diaDoMes: 10, categoriaId: impostosId },
    { descricao: 'TV (Inter)', valor: 420, diaDoMes: 10, categoriaId: moradiaId },
    { descricao: 'Farmácia', valor: 130, diaDoMes: 10, categoriaId: saudeId },
    // Parcelas de cartão
    { descricao: 'Renner (parcelas)', valor: 111, diaDoMes: 15, categoriaId: outrosId, cartaoId: rennerId },
    { descricao: 'Bradesco (fatura)', valor: 954, diaDoMes: 10, categoriaId: outrosId, cartaoId: bradescoId },
    { descricao: 'Nubank (fatura)', valor: 1765, diaDoMes: 10, categoriaId: outrosId, cartaoId: nubankId },
    { descricao: 'Amazon (fatura)', valor: 1129, diaDoMes: 10, categoriaId: outrosId, cartaoId: amazonId },
    { descricao: 'Itaú (fatura)', valor: 641, diaDoMes: 10, categoriaId: outrosId, cartaoId: itauId },
    // Assinaturas
    { descricao: 'Spotify', valor: 5.80, diaDoMes: 2, categoriaId: assinaturasId },
    { descricao: 'Amazon Prime', valor: 20, diaDoMes: 25, categoriaId: assinaturasId },
    { descricao: '1Password', valor: 9.56, diaDoMes: 13, categoriaId: assinaturasId },
    { descricao: 'Apple (assinatura)', valor: 15, diaDoMes: 11, categoriaId: assinaturasId },
    { descricao: 'Google Drive', valor: 15, diaDoMes: 1, categoriaId: assinaturasId },
    { descricao: 'Gympass', valor: 100, diaDoMes: 1, categoriaId: saudeId },
    { descricao: 'YouTube Premium', valor: 7, diaDoMes: 30, categoriaId: lazerId },
    { descricao: 'Internet', valor: 113, diaDoMes: 15, categoriaId: moradiaId },
    { descricao: 'Dízimo', valor: 20, diaDoMes: 10, categoriaId: outrosId },
    { descricao: 'Cabelo', valor: 90, diaDoMes: 15, categoriaId: outrosId },
    { descricao: 'Robson (relógio)', valor: 100, diaDoMes: 10, categoriaId: financiamentoId },
  ]

  for (const d of despesasFixas) {
    const exists = await prisma.despesaFixa.findFirst({ where: { descricao: d.descricao } })
    if (!exists) {
      await prisma.despesaFixa.create({ data: d })
    }
  }

  console.log('Seed concluído com sucesso!')
}

main().catch(console.error).finally(() => prisma.$disconnect())

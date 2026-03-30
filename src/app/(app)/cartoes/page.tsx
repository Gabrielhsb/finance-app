'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, CreditCard, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Cartao {
  id: string
  nome: string
  bandeira: string
  cor: string
  faturas: { mes: number; ano: number; valor: number }[]
}

export default function CartoesPage() {
  const { mes, ano } = getCurrentMonth()
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [modalNovo, setModalNovo] = useState(false)
  const [modalFatura, setModalFatura] = useState<Cartao | null>(null)
  const [form, setForm] = useState({ nome: '', bandeira: 'visa', cor: '#6366f1' })
  const [fatura, setFatura] = useState({ mes: String(mes), ano: String(ano), valor: '' })

  async function fetchCartoes() {
    const res = await fetch('/api/cartoes')
    setCartoes(await res.json())
  }

  useEffect(() => { fetchCartoes() }, [])

  async function criarCartao() {
    const res = await fetch('/api/cartoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Cartão criado!')
      setModalNovo(false)
      setForm({ nome: '', bandeira: 'visa', cor: '#6366f1' })
      fetchCartoes()
    } else {
      toast.error('Erro ao criar cartão')
    }
  }

  async function lancarFatura() {
    if (!modalFatura) return
    const res = await fetch('/api/faturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartaoId: modalFatura.id,
        mes: Number(fatura.mes),
        ano: Number(fatura.ano),
        valor: Number(fatura.valor),
      }),
    })
    if (res.ok) {
      toast.success('Fatura lançada!')
      setModalFatura(null)
      fetchCartoes()
    } else {
      toast.error('Erro ao lançar fatura')
    }
  }

  async function deletarCartao(id: string) {
    await fetch(`/api/cartoes/${id}`, { method: 'DELETE' })
    toast.success('Cartão removido')
    fetchCartoes()
  }

  return (
    <>
      <Header title="Cartões">
        <Button onClick={() => setModalNovo(true)} size="sm">
          <Plus className="w-4 h-4" /> Novo Cartão
        </Button>
      </Header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.map((cartao) => {
            const faturaAtual = cartao.faturas?.[0]
            return (
              <Card key={cartao.id} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cartao.cor}20` }}>
                      <CreditCard className="w-5 h-5" style={{ color: cartao.cor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{cartao.nome}</p>
                      <p className="text-xs text-gray-500 capitalize">{cartao.bandeira}</p>
                    </div>
                  </div>
                  <button onClick={() => deletarCartao(cartao.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Fatura atual</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {faturaAtual ? formatCurrency(faturaAtual.valor) : '—'}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => { setModalFatura(cartao); setFatura({ mes: String(mes), ano: String(ano), valor: '' }) }}>
                    Lançar fatura
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {cartoes.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum cartão cadastrado</p>
          </div>
        )}
      </div>

      <Modal open={modalNovo} onClose={() => setModalNovo(false)} title="Novo Cartão">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Ex: Nubank" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Select label="Bandeira" value={form.bandeira} onChange={(e) => setForm({ ...form, bandeira: e.target.value })}>
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="elo">Elo</option>
            <option value="amex">American Express</option>
          </Select>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
            <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="w-12 h-10 rounded cursor-pointer border border-gray-300" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalNovo(false)}>Cancelar</Button>
            <Button onClick={criarCartao}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!modalFatura} onClose={() => setModalFatura(null)} title={`Fatura — ${modalFatura?.nome}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Mês" value={fatura.mes} onChange={(e) => setFatura({ ...fatura, mes: e.target.value })}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
            <Input label="Ano" type="number" value={fatura.ano} onChange={(e) => setFatura({ ...fatura, ano: e.target.value })} />
          </div>
          <Input label="Valor (R$)" type="number" step="0.01" placeholder="0,00" value={fatura.valor} onChange={(e) => setFatura({ ...fatura, valor: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalFatura(null)}>Cancelar</Button>
            <Button onClick={lancarFatura}>Lançar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { CardBrandLogo } from '@/components/ui/CardBrandLogo'
import { toast } from 'sonner'

interface Cartao {
  id: string
  nome: string
  bandeira: string
  cor: string
  faturas: { mes: number; ano: number; valor: number }[]
}

export default function CartoesPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [modalNovo, setModalNovo] = useState(false)
  const [modalFatura, setModalFatura] = useState<Cartao | null>(null)
  const [form, setForm] = useState({ nome: '', bandeira: 'visa', cor: '#6366f1' })
  const [fatura, setFatura] = useState({ mes: String(mesAtual), ano: String(anoAtual), valor: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCartoes = useCallback(async () => {
    const res = await fetch(`/api/cartoes?mes=${mes}&ano=${ano}`)
    setCartoes(await res.json())
  }, [mes, ano])

  useEffect(() => { fetchCartoes() }, [fetchCartoes])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setModalNovo(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function criarCartao() {
    if (!form.nome.trim()) { toast.error('Informe o nome do cartão'); return }
    setSubmitting(true)
    try {
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
    } finally {
      setSubmitting(false)
    }
  }

  async function lancarFatura() {
    if (!modalFatura) return
    if (!fatura.valor || Number(fatura.valor) <= 0) { toast.error('Informe um valor válido'); return }
    setSubmitting(true)
    try {
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
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmarDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await fetch(`/api/cartoes/${confirmDelete.id}`, { method: 'DELETE' })
      toast.success('Cartão removido')
      setConfirmDelete(null)
      fetchCartoes()
    } finally {
      setDeleting(false)
    }
  }

  function abrirModalFatura(cartao: Cartao) {
    setModalFatura(cartao)
    const faturaExistente = cartao.faturas?.[0]
    setFatura({
      mes: String(faturaExistente?.mes ?? mes),
      ano: String(faturaExistente?.ano ?? ano),
      valor: faturaExistente ? String(faturaExistente.valor) : '',
    })
  }

  return (
    <>
      <Header title="Cartões">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
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
                    <CardBrandLogo bandeira={cartao.bandeira} className="w-12 h-8 rounded" />
                    <div>
                      <p className="font-semibold text-text-primary">{cartao.nome}</p>
                      <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: cartao.cor }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDelete({ id: cartao.id, nome: cartao.nome })}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded text-text-tertiary hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-tertiary">Fatura do mês</p>
                    <p className="font-bold tabular text-text-primary">
                      {faturaAtual ? formatCurrency(faturaAtual.valor) : '—'}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => abrirModalFatura(cartao)}>
                    Lançar fatura
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {cartoes.length === 0 && (
          <div className="text-center py-16 text-text-tertiary">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum cartão cadastrado</p>
            <p className="text-xs mt-1 opacity-60">Clique em "Novo Cartão" para começar</p>
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
            <label className="text-xs font-medium text-text-secondary">Cor</label>
            <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="w-12 h-10 rounded cursor-pointer border border-border" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalNovo(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={criarCartao} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
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
            <Button variant="secondary" onClick={() => setModalFatura(null)} disabled={submitting}>Cancelar</Button>
            <Button onClick={lancarFatura} disabled={submitting}>{submitting ? 'Lançando…' : 'Lançar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmarDelete}
        title="Excluir cartão"
        description={`"${confirmDelete?.nome}" e todas as suas faturas serão removidos permanentemente.`}
        loading={deleting}
      />
    </>
  )
}

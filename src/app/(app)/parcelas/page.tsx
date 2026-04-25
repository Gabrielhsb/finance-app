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
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, getCurrentMonth, formatMonth } from '@/lib/utils'
import { Plus, Trash2, Layers, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface Cartao { id: string; nome: string; cor: string }
interface Categoria { id: string; nome: string; cor: string; icone: string }

interface CompraParcelada {
  id: string
  descricao: string
  valorParcela: number
  totalParcelas: number
  mesInicio: number
  anoInicio: number
  cartao: Cartao | null
  categoria: Categoria | null
}

const FORM_EMPTY = {
  descricao: '',
  valorParcela: '',
  totalParcelas: '',
  mesInicio: '',
  anoInicio: '',
  cartaoId: '',
  categoriaId: '',
}

function calcParcelAtual(item: CompraParcelada, mes: number, ano: number): number {
  const startIdx = item.anoInicio * 12 + (item.mesInicio - 1)
  const viewIdx = ano * 12 + (mes - 1)
  return viewIdx - startIdx + 1
}

function calcEndDate(item: CompraParcelada): { mes: number; ano: number } {
  const startIdx = item.anoInicio * 12 + (item.mesInicio - 1)
  const endIdx = startIdx + item.totalParcelas - 1
  return { mes: (endIdx % 12) + 1, ano: Math.floor(endIdx / 12) }
}

function calcRestante(item: CompraParcelada, mes: number, ano: number): number {
  const parcelAtual = calcParcelAtual(item, mes, ano)
  if (parcelAtual > item.totalParcelas) return 0
  const restantes = parcelAtual < 1 ? item.totalParcelas : item.totalParcelas - parcelAtual + 1
  return restantes * item.valorParcela
}

export default function ParcelasPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [parcelas, setParcelas] = useState<CompraParcelada[]>([])
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<CompraParcelada | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; descricao: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState(FORM_EMPTY)

  const fetchParcelas = useCallback(async () => {
    const res = await fetch('/api/parcelas')
    setParcelas(await res.json())
  }, [])

  useEffect(() => {
    fetchParcelas()
    fetch('/api/cartoes').then(r => r.json()).then(setCartoes)
    fetch('/api/categorias').then(r => r.json()).then(setCategorias)
  }, [fetchParcelas])

  // Keyboard shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); abrirNovo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function abrirNovo() {
    setEditItem(null)
    setForm({ ...FORM_EMPTY, mesInicio: String(mesAtual), anoInicio: String(anoAtual) })
    setModalOpen(true)
  }

  function abrirEdit(p: CompraParcelada) {
    setEditItem(p)
    setForm({
      descricao: p.descricao,
      valorParcela: String(p.valorParcela),
      totalParcelas: String(p.totalParcelas),
      mesInicio: String(p.mesInicio),
      anoInicio: String(p.anoInicio),
      cartaoId: p.cartao?.id ?? '',
      categoriaId: p.categoria?.id ?? '',
    })
    setModalOpen(true)
  }

  async function salvar() {
    if (!form.descricao.trim()) { toast.error('Informe a descrição'); return }
    if (!form.valorParcela || Number(form.valorParcela) <= 0) { toast.error('Informe o valor da parcela'); return }
    if (!form.totalParcelas || Number(form.totalParcelas) < 1) { toast.error('Informe o número de parcelas'); return }
    setSubmitting(true)
    try {
      const url = editItem ? `/api/parcelas/${editItem.id}` : '/api/parcelas'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valorParcela: Number(form.valorParcela),
          totalParcelas: Number(form.totalParcelas),
          mesInicio: Number(form.mesInicio),
          anoInicio: Number(form.anoInicio),
        }),
      })
      if (res.ok) {
        toast.success(editItem ? 'Parcelamento atualizado!' : 'Compra parcelada cadastrada!')
        setModalOpen(false)
        fetchParcelas()
      } else {
        toast.error('Erro ao salvar')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmarDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await fetch(`/api/parcelas/${confirmDelete.id}`, { method: 'DELETE' })
      toast.success('Removida')
      setConfirmDelete(null)
      fetchParcelas()
    } finally {
      setDeleting(false)
    }
  }

  const ativas = parcelas.filter(p => {
    const n = calcParcelAtual(p, mes, ano)
    return n >= 1 && n <= p.totalParcelas
  })
  const concluidas = parcelas.filter(p => calcParcelAtual(p, mes, ano) > p.totalParcelas)
  const futuras = parcelas.filter(p => calcParcelAtual(p, mes, ano) < 1)

  const totalMes = ativas.reduce((s, p) => s + p.valorParcela, 0)
  const totalRestante = parcelas
    .filter(p => calcParcelAtual(p, mes, ano) <= p.totalParcelas)
    .reduce((s, p) => s + calcRestante(p, mes, ano), 0)

  return (
    <>
      <Header title="Parcelas">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
        <Button onClick={abrirNovo} size="sm">
          <Plus className="w-4 h-4" /> Nova Parcela
        </Button>
      </Header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {parcelas.length === 0 ? (
          <div className="text-center py-16 text-text-tertiary">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma compra parcelada cadastrada</p>
            <p className="text-xs mt-1 opacity-60">Clique em "Nova Parcela" para começar</p>
          </div>
        ) : (
          <>
            <Card className="flex items-center gap-4">
              <Layers className="w-8 h-8 text-brand-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Total em parcelas — {formatMonth(mes, ano)}</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="text-2xl font-bold tabular text-brand-600 dark:text-brand-400">{formatCurrency(totalMes)}<span className="text-sm font-normal text-gray-400">/mês</span></p>
                  <p className="text-sm text-gray-500">Restante total: <span className="font-semibold tabular text-text-secondary">{formatCurrency(totalRestante)}</span></p>
                </div>
              </div>
            </Card>

            {ativas.length > 0 && (
              <section>
                <h3 className="font-semibold text-text-secondary mb-3">Ativas neste mês</h3>
                <div className="space-y-3">
                  {ativas.map(p => (
                    <ParcelaCard key={p.id} parcela={p} mes={mes} ano={ano}
                      onEdit={() => abrirEdit(p)}
                      onDelete={(id, desc) => setConfirmDelete({ id, descricao: desc })}
                    />
                  ))}
                </div>
              </section>
            )}

            {futuras.length > 0 && (
              <section>
                <h3 className="font-semibold text-text-tertiary mb-3">Início futuro</h3>
                <div className="space-y-3">
                  {futuras.map(p => (
                    <ParcelaCard key={p.id} parcela={p} mes={mes} ano={ano}
                      onEdit={() => abrirEdit(p)}
                      onDelete={(id, desc) => setConfirmDelete({ id, descricao: desc })}
                    />
                  ))}
                </div>
              </section>
            )}

            {concluidas.length > 0 && (
              <section>
                <h3 className="font-semibold text-text-disabled mb-3">Concluídas neste mês</h3>
                <div className="space-y-3">
                  {concluidas.map(p => (
                    <ParcelaCard key={p.id} parcela={p} mes={mes} ano={ano}
                      onEdit={() => abrirEdit(p)}
                      onDelete={(id, desc) => setConfirmDelete({ id, descricao: desc })}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Parcelamento' : 'Nova Compra Parcelada'}>
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: iPhone 16" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor da parcela (R$)" type="number" step="0.01" value={form.valorParcela} onChange={e => setForm({ ...form, valorParcela: e.target.value })} />
            <Input label="Total de parcelas" type="number" min="1" value={form.totalParcelas} onChange={e => setForm({ ...form, totalParcelas: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Mês inicial" value={form.mesInicio} onChange={e => setForm({ ...form, mesInicio: e.target.value })}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Select>
            <Input label="Ano inicial" type="number" value={form.anoInicio} onChange={e => setForm({ ...form, anoInicio: e.target.value })} />
          </div>
          <Select label="Cartão (opcional)" value={form.cartaoId} onChange={e => setForm({ ...form, cartaoId: e.target.value })}>
            <option value="">Nenhum</option>
            {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Select label="Categoria (opcional)" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })}>
            <option value="">Nenhuma</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={salvar} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmarDelete}
        title="Excluir parcelamento"
        description={`"${confirmDelete?.descricao}" e todas as parcelas futuras serão removidas permanentemente.`}
        loading={deleting}
      />
    </>
  )
}

function ParcelaCard({ parcela, mes, ano, onEdit, onDelete }: {
  parcela: CompraParcelada
  mes: number
  ano: number
  onEdit: () => void
  onDelete: (id: string, descricao: string) => void
}) {
  const parcelAtual = calcParcelAtual(parcela, mes, ano)
  const endDate = calcEndDate(parcela)
  const pct = Math.round((Math.max(0, Math.min(parcelAtual, parcela.totalParcelas)) / parcela.totalParcelas) * 100)
  const concluida = parcelAtual > parcela.totalParcelas
  const futura = parcelAtual < 1
  const restante = calcRestante(parcela, mes, ano)
  const parcelasRestantes = concluida ? 0 : futura ? parcela.totalParcelas : parcela.totalParcelas - parcelAtual + 1

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-text-primary">{parcela.descricao}</p>
          {parcela.categoria && <Badge color={parcela.categoria.cor}>{parcela.categoria.nome}</Badge>}
          {parcela.cartao && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${parcela.cartao.cor}20`, color: parcela.cartao.cor }}>
              {parcela.cartao.nome}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1 text-text-tertiary hover:text-brand-500 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(parcela.id, parcela.descricao)} className="p-1 text-text-tertiary hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {concluida ? 'Concluída' : futura ? `Inicia em ${formatMonth(parcela.mesInicio, parcela.anoInicio)}` : `${parcelAtual} de ${parcela.totalParcelas} parcelas`}
          </span>
          <span className="font-semibold tabular text-text-primary">{formatCurrency(parcela.valorParcela)}/mês</span>
        </div>
        <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${concluida ? 'bg-green-500' : futura ? 'bg-border' : 'bg-brand-500'}`}
            style={{ width: `${concluida ? 100 : futura ? 0 : pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatMonth(parcela.mesInicio, parcela.anoInicio)}</span>
          <span>Termina em {formatMonth(endDate.mes, endDate.ano)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
        <span className="text-text-tertiary">Total pago: <span className="tabular">{formatCurrency(parcela.valorParcela * Math.max(0, Math.min(parcelAtual - 1, parcela.totalParcelas)))}</span></span>
        {!concluida && (
          <span className="text-gray-500 font-medium">
            Restante: <span className="tabular text-text-secondary">{formatCurrency(restante)}</span>
            <span className="text-text-tertiary"> ({parcelasRestantes}x)</span>
          </span>
        )}
      </div>
    </Card>
  )
}

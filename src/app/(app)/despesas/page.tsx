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
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, Trash2, TrendingDown, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface Categoria { id: string; nome: string; cor: string; icone: string }
interface Cartao { id: string; nome: string }
interface DespesaFixa { id: string; descricao: string; valor: number; diaDoMes: number; categoria: Categoria; cartao: Cartao | null }
interface DespesaVariavel { id: string; descricao: string; valor: number; data: string; categoria: Categoria; cartao: Cartao | null }

type ConfirmItem = { id: string; descricao: string; tipo: 'fixa' | 'variavel' }

const FORM_FIXA_EMPTY = { descricao: '', valor: '', diaDoMes: '1', categoriaId: '', cartaoId: '' }
const FORM_VARIAVEL_EMPTY = { descricao: '', valor: '', data: '', categoriaId: '', cartaoId: '' }

export default function DespesasPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [fixas, setFixas] = useState<DespesaFixa[]>([])
  const [variaveis, setVariaveis] = useState<DespesaVariavel[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cartoes, setCartoes] = useState<Cartao[]>([])
  const [modalFixa, setModalFixa] = useState(false)
  const [modalVariavel, setModalVariavel] = useState(false)
  const [editFixa, setEditFixa] = useState<DespesaFixa | null>(null)
  const [editVariavel, setEditVariavel] = useState<DespesaVariavel | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [formFixa, setFormFixa] = useState(FORM_FIXA_EMPTY)
  const [formVariavel, setFormVariavel] = useState(FORM_VARIAVEL_EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFixas = useCallback(async () => {
    const res = await fetch('/api/despesas/fixas')
    setFixas(await res.json())
  }, [])

  const fetchVariaveis = useCallback(async () => {
    const url = `/api/despesas/variaveis?mes=${mes}&ano=${ano}${filtroCategoria ? `&categoriaId=${filtroCategoria}` : ''}`
    const res = await fetch(url)
    setVariaveis(await res.json())
  }, [mes, ano, filtroCategoria])

  useEffect(() => {
    fetchFixas(); fetchVariaveis()
    fetch('/api/categorias').then(r => r.json()).then(setCategorias)
    fetch('/api/cartoes').then(r => r.json()).then(setCartoes)
  }, [fetchFixas, fetchVariaveis])

  // Keyboard shortcut: N → nova despesa variável
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); abrirNovaVariavel() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const totalFixas = fixas.reduce((s, d) => s + d.valor, 0)
  const totalVariaveis = variaveis.reduce((s, d) => s + d.valor, 0)

  function abrirNovaFixa() { setEditFixa(null); setFormFixa(FORM_FIXA_EMPTY); setModalFixa(true) }
  function abrirEditFixa(d: DespesaFixa) {
    setEditFixa(d)
    setFormFixa({ descricao: d.descricao, valor: String(d.valor), diaDoMes: String(d.diaDoMes), categoriaId: d.categoria.id, cartaoId: d.cartao?.id ?? '' })
    setModalFixa(true)
  }
  function abrirNovaVariavel() { setEditVariavel(null); setFormVariavel(FORM_VARIAVEL_EMPTY); setModalVariavel(true) }
  function abrirEditVariavel(d: DespesaVariavel) {
    setEditVariavel(d)
    setFormVariavel({ descricao: d.descricao, valor: String(d.valor), data: d.data.slice(0, 10), categoriaId: d.categoria.id, cartaoId: d.cartao?.id ?? '' })
    setModalVariavel(true)
  }

  async function salvarFixa() {
    if (!formFixa.descricao.trim()) { toast.error('Informe a descrição'); return }
    if (!formFixa.valor || Number(formFixa.valor) <= 0) { toast.error('Informe um valor válido'); return }
    if (!formFixa.categoriaId) { toast.error('Selecione uma categoria'); return }
    setSubmitting(true)
    try {
      const url = editFixa ? `/api/despesas/fixas/${editFixa.id}` : '/api/despesas/fixas'
      const method = editFixa ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formFixa, valor: Number(formFixa.valor), diaDoMes: Number(formFixa.diaDoMes) }),
      })
      if (res.ok) { toast.success(editFixa ? 'Despesa atualizada!' : 'Despesa fixa criada!'); setModalFixa(false); fetchFixas() }
      else toast.error('Erro ao salvar despesa')
    } finally { setSubmitting(false) }
  }

  async function salvarVariavel() {
    if (!formVariavel.descricao.trim()) { toast.error('Informe a descrição'); return }
    if (!formVariavel.valor || Number(formVariavel.valor) <= 0) { toast.error('Informe um valor válido'); return }
    if (!formVariavel.data) { toast.error('Informe a data'); return }
    if (!formVariavel.categoriaId) { toast.error('Selecione uma categoria'); return }
    setSubmitting(true)
    try {
      const url = editVariavel ? `/api/despesas/variaveis/${editVariavel.id}` : '/api/despesas/variaveis'
      const method = editVariavel ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formVariavel, valor: Number(formVariavel.valor) }),
      })
      if (res.ok) { toast.success(editVariavel ? 'Despesa atualizada!' : 'Despesa lançada!'); setModalVariavel(false); fetchVariaveis() }
      else toast.error('Erro ao salvar despesa')
    } finally { setSubmitting(false) }
  }

  async function confirmarDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const url = confirmDelete.tipo === 'fixa'
        ? `/api/despesas/fixas/${confirmDelete.id}`
        : `/api/despesas/variaveis/${confirmDelete.id}`
      await fetch(url, { method: 'DELETE' })
      toast.success('Removida')
      setConfirmDelete(null)
      confirmDelete.tipo === 'fixa' ? fetchFixas() : fetchVariaveis()
    } finally { setDeleting(false) }
  }

  return (
    <>
      <Header title="Despesas">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </Header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="flex items-center gap-4">
          <TrendingDown className="w-8 h-8 text-red-500 opacity-70" />
          <div>
            <p className="text-sm text-gray-500">Total de despesas do mês</p>
            <p className="text-2xl font-bold tabular text-red-500">{formatCurrency(totalFixas + totalVariaveis)}</p>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-secondary">Despesas Fixas</h3>
            <Button size="sm" variant="secondary" onClick={abrirNovaFixa}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {fixas.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma despesa fixa cadastrada</p>}
            {fixas.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge color={d.categoria.cor}>{d.categoria.nome}</Badge>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{d.descricao}</p>
                    <p className="text-xs text-gray-500">Vence dia {d.diaDoMes}{d.cartao ? ` · ${d.cartao.nome}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular text-red-500">{formatCurrency(d.valor)}</span>
                  <button onClick={() => abrirEditFixa(d)} className="p-1 text-text-tertiary hover:text-brand-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({ id: d.id, descricao: d.descricao, tipo: 'fixa' })} className="p-1 text-text-tertiary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {fixas.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-surface-raised">
                <span className="text-sm font-semibold tabular text-red-500">Subtotal: {formatCurrency(totalFixas)}</span>
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-secondary">Despesas Variáveis</h3>
            <div className="flex items-center gap-2">
              <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="text-sm rounded-lg border border-border bg-surface-card px-2 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-colors">
                <option value="">Todas categorias</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <Button size="sm" variant="secondary" onClick={abrirNovaVariavel}><Plus className="w-4 h-4" /> Adicionar</Button>
            </div>
          </div>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {variaveis.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma despesa variável neste mês</p>}
            {variaveis.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge color={d.categoria.cor}>{d.categoria.nome}</Badge>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{d.descricao}</p>
                    <p className="text-xs text-gray-500">{new Date(d.data).toLocaleDateString('pt-BR')}{d.cartao ? ` · ${d.cartao.nome}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular text-red-500">{formatCurrency(d.valor)}</span>
                  <button onClick={() => abrirEditVariavel(d)} className="p-1 text-text-tertiary hover:text-brand-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({ id: d.id, descricao: d.descricao, tipo: 'variavel' })} className="p-1 text-text-tertiary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {variaveis.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-surface-raised">
                <span className="text-sm font-semibold tabular text-red-500">Subtotal: {formatCurrency(totalVariaveis)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={modalFixa} onClose={() => setModalFixa(false)} title={editFixa ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}>
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Aluguel" value={formFixa.descricao} onChange={(e) => setFormFixa({ ...formFixa, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formFixa.valor} onChange={(e) => setFormFixa({ ...formFixa, valor: e.target.value })} />
          <Input label="Dia de vencimento" type="number" min="1" max="31" value={formFixa.diaDoMes} onChange={(e) => setFormFixa({ ...formFixa, diaDoMes: e.target.value })} />
          <Select label="Categoria" value={formFixa.categoriaId} onChange={(e) => setFormFixa({ ...formFixa, categoriaId: e.target.value })}>
            <option value="">Selecione...</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Select label="Cartão (opcional)" value={formFixa.cartaoId} onChange={(e) => setFormFixa({ ...formFixa, cartaoId: e.target.value })}>
            <option value="">Nenhum</option>
            {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalFixa(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={salvarFixa} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalVariavel} onClose={() => setModalVariavel(false)} title={editVariavel ? 'Editar Despesa Variável' : 'Nova Despesa Variável'}>
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Mercado" value={formVariavel.descricao} onChange={(e) => setFormVariavel({ ...formVariavel, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formVariavel.valor} onChange={(e) => setFormVariavel({ ...formVariavel, valor: e.target.value })} />
          <Input label="Data" type="date" value={formVariavel.data} onChange={(e) => setFormVariavel({ ...formVariavel, data: e.target.value })} />
          <Select label="Categoria" value={formVariavel.categoriaId} onChange={(e) => setFormVariavel({ ...formVariavel, categoriaId: e.target.value })}>
            <option value="">Selecione...</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Select label="Cartão (opcional)" value={formVariavel.cartaoId} onChange={(e) => setFormVariavel({ ...formVariavel, cartaoId: e.target.value })}>
            <option value="">Nenhum</option>
            {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalVariavel(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={salvarVariavel} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmarDelete}
        title="Excluir despesa"
        description={`"${confirmDelete?.descricao}" será removida permanentemente.`}
        loading={deleting}
      />
    </>
  )
}

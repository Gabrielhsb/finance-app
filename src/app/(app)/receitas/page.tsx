'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, Trash2, TrendingUp, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface ReceitaFixa { id: string; descricao: string; valor: number; diaDoMes: number }
interface ReceitaVariavel { id: string; descricao: string; valor: number; data: string }

type ConfirmItem = { id: string; descricao: string; tipo: 'fixa' | 'variavel' }

export default function ReceitasPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [fixas, setFixas] = useState<ReceitaFixa[]>([])
  const [variaveis, setVariaveis] = useState<ReceitaVariavel[]>([])
  const [modalFixa, setModalFixa] = useState(false)
  const [modalVariavel, setModalVariavel] = useState(false)
  const [editFixa, setEditFixa] = useState<ReceitaFixa | null>(null)
  const [editVariavel, setEditVariavel] = useState<ReceitaVariavel | null>(null)
  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '', diaDoMes: '1' })
  const [formVariavel, setFormVariavel] = useState({ descricao: '', valor: '', data: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFixas = useCallback(async () => {
    const res = await fetch('/api/receitas/fixas')
    setFixas(await res.json())
  }, [])

  const fetchVariaveis = useCallback(async () => {
    const res = await fetch(`/api/receitas/variaveis?mes=${mes}&ano=${ano}`)
    setVariaveis(await res.json())
  }, [mes, ano])

  useEffect(() => { fetchFixas(); fetchVariaveis() }, [fetchFixas, fetchVariaveis])

  // Keyboard shortcut: N → nova receita fixa
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); abrirNovaFixa() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const totalFixas = fixas.reduce((s, r) => s + r.valor, 0)
  const totalVariaveis = variaveis.reduce((s, r) => s + r.valor, 0)

  function abrirNovaFixa() { setEditFixa(null); setFormFixa({ descricao: '', valor: '', diaDoMes: '1' }); setModalFixa(true) }
  function abrirEditFixa(r: ReceitaFixa) { setEditFixa(r); setFormFixa({ descricao: r.descricao, valor: String(r.valor), diaDoMes: String(r.diaDoMes) }); setModalFixa(true) }
  function abrirNovaVariavel() { setEditVariavel(null); setFormVariavel({ descricao: '', valor: '', data: '' }); setModalVariavel(true) }
  function abrirEditVariavel(r: ReceitaVariavel) { setEditVariavel(r); setFormVariavel({ descricao: r.descricao, valor: String(r.valor), data: r.data.slice(0, 10) }); setModalVariavel(true) }

  async function salvarFixa() {
    if (!formFixa.descricao.trim()) { toast.error('Informe a descrição'); return }
    if (!formFixa.valor || Number(formFixa.valor) <= 0) { toast.error('Informe um valor válido'); return }
    setSubmitting(true)
    try {
      const url = editFixa ? `/api/receitas/fixas/${editFixa.id}` : '/api/receitas/fixas'
      const method = editFixa ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: formFixa.descricao, valor: Number(formFixa.valor), diaDoMes: Number(formFixa.diaDoMes) }),
      })
      if (res.ok) { toast.success(editFixa ? 'Receita atualizada!' : 'Receita fixa criada!'); setModalFixa(false); fetchFixas() }
      else toast.error('Erro ao salvar receita')
    } finally { setSubmitting(false) }
  }

  async function salvarVariavel() {
    if (!formVariavel.descricao.trim()) { toast.error('Informe a descrição'); return }
    if (!formVariavel.valor || Number(formVariavel.valor) <= 0) { toast.error('Informe um valor válido'); return }
    if (!formVariavel.data) { toast.error('Informe a data'); return }
    setSubmitting(true)
    try {
      const url = editVariavel ? `/api/receitas/variaveis/${editVariavel.id}` : '/api/receitas/variaveis'
      const method = editVariavel ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: formVariavel.descricao, valor: Number(formVariavel.valor), data: formVariavel.data }),
      })
      if (res.ok) { toast.success(editVariavel ? 'Receita atualizada!' : 'Receita lançada!'); setModalVariavel(false); fetchVariaveis() }
      else toast.error('Erro ao salvar receita')
    } finally { setSubmitting(false) }
  }

  async function confirmarDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const url = confirmDelete.tipo === 'fixa'
        ? `/api/receitas/fixas/${confirmDelete.id}`
        : `/api/receitas/variaveis/${confirmDelete.id}`
      await fetch(url, { method: 'DELETE' })
      toast.success('Removida')
      setConfirmDelete(null)
      confirmDelete.tipo === 'fixa' ? fetchFixas() : fetchVariaveis()
    } finally { setDeleting(false) }
  }

  return (
    <>
      <Header title="Receitas">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </Header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-emerald-500 opacity-70" />
          <div>
            <p className="text-sm text-gray-500">Total de receitas do mês</p>
            <p className="text-2xl font-bold tabular text-emerald-600">{formatCurrency(totalFixas + totalVariaveis)}</p>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-secondary">Receitas Fixas</h3>
            <Button size="sm" variant="secondary" onClick={abrirNovaFixa}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {fixas.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma receita fixa cadastrada</p>}
            {fixas.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.descricao}</p>
                  <p className="text-xs text-gray-500">Todo dia {r.diaDoMes}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular text-emerald-600">{formatCurrency(r.valor)}</span>
                  <button onClick={() => abrirEditFixa(r)} className="p-1 text-text-tertiary hover:text-brand-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({ id: r.id, descricao: r.descricao, tipo: 'fixa' })} className="p-1 text-text-tertiary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {fixas.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-surface-raised">
                <span className="text-sm font-semibold tabular text-emerald-600">Subtotal: {formatCurrency(totalFixas)}</span>
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-secondary">Receitas Variáveis</h3>
            <Button size="sm" variant="secondary" onClick={abrirNovaVariavel}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-border p-0 overflow-hidden">
            {variaveis.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma receita variável neste mês</p>}
            {variaveis.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.descricao}</p>
                  <p className="text-xs text-gray-500">{new Date(r.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular text-emerald-600">{formatCurrency(r.valor)}</span>
                  <button onClick={() => abrirEditVariavel(r)} className="p-1 text-text-tertiary hover:text-brand-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete({ id: r.id, descricao: r.descricao, tipo: 'variavel' })} className="p-1 text-text-tertiary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {variaveis.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-surface-raised">
                <span className="text-sm font-semibold tabular text-emerald-600">Subtotal: {formatCurrency(totalVariaveis)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={modalFixa} onClose={() => setModalFixa(false)} title={editFixa ? 'Editar Receita Fixa' : 'Nova Receita Fixa'}>
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Salário" value={formFixa.descricao} onChange={(e) => setFormFixa({ ...formFixa, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formFixa.valor} onChange={(e) => setFormFixa({ ...formFixa, valor: e.target.value })} />
          <Input label="Dia do mês" type="number" min="1" max="31" value={formFixa.diaDoMes} onChange={(e) => setFormFixa({ ...formFixa, diaDoMes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalFixa(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={salvarFixa} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalVariavel} onClose={() => setModalVariavel(false)} title={editVariavel ? 'Editar Receita Variável' : 'Nova Receita Variável'}>
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Freelance" value={formVariavel.descricao} onChange={(e) => setFormVariavel({ ...formVariavel, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formVariavel.valor} onChange={(e) => setFormVariavel({ ...formVariavel, valor: e.target.value })} />
          <Input label="Data" type="date" value={formVariavel.data} onChange={(e) => setFormVariavel({ ...formVariavel, data: e.target.value })} />
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
        title="Excluir receita"
        description={`"${confirmDelete?.descricao}" será removida permanentemente.`}
        loading={deleting}
      />
    </>
  )
}

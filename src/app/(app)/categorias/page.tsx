'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Categoria { id: string; nome: string; cor: string; icone: string }

const ICONES_DISPONIVEIS = ['home', 'utensils', 'car', 'heart-pulse', 'gamepad-2', 'circle-ellipsis', 'shopping-cart', 'zap', 'wifi', 'book', 'music', 'plane', 'paw-print']

function DynamicIcon({ name, ...props }: { name: string; className?: string; style?: React.CSSProperties }) {
  const iconName = name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('') as keyof typeof LucideIcons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = LucideIcons[iconName] as any
  if (!Icon) return <Tag {...props} />
  return <Icon {...props} />
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome: '', cor: '#6366f1', icone: 'circle-ellipsis' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchCategorias() {
    const res = await fetch('/api/categorias')
    setCategorias(await res.json())
  }

  useEffect(() => { fetchCategorias() }, [])

  async function criar() {
    if (!form.nome.trim()) { toast.error('Informe o nome da categoria'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success('Categoria criada!'); setModal(false); setForm({ nome: '', cor: '#6366f1', icone: 'circle-ellipsis' }); fetchCategorias() }
      else toast.error('Erro ao criar categoria')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmarDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categorias/${confirmDelete.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Removida'); setConfirmDelete(null); fetchCategorias() }
      else { toast.error('Não é possível remover — categoria em uso'); setConfirmDelete(null) }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Header title="Categorias">
        <Button size="sm" onClick={() => setModal(true)}><Plus className="w-4 h-4" /> Nova Categoria</Button>
      </Header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((cat) => (
            <Card key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.cor}20` }}>
                  <DynamicIcon name={cat.icone} className="w-5 h-5" style={{ color: cat.cor }} />
                </div>
                <p className="font-medium text-text-primary">{cat.nome}</p>
              </div>
              <button
                onClick={() => setConfirmDelete(cat)}
                className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>

        {categorias.length === 0 && (
          <div className="text-center py-16 text-text-tertiary">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma categoria cadastrada</p>
            <p className="text-xs mt-1 opacity-60">Clique em "Nova Categoria" para começar</p>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nova Categoria">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Ex: Educação" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Cor</label>
            <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="w-12 h-10 rounded cursor-pointer border border-border" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONES_DISPONIVEIS.map((icone) => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setForm({ ...form, icone })}
                  className={`p-2 rounded-lg border-2 transition-colors ${form.icone === icone ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-border hover:border-border-strong'}`}
                >
                  <DynamicIcon name={icone} className="w-5 h-5 text-text-secondary" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={criar} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmarDelete}
        title="Excluir categoria"
        description={`"${confirmDelete?.nome}" será removida permanentemente. Isso só é possível se não houver despesas vinculadas.`}
        loading={deleting}
      />
    </>
  )
}

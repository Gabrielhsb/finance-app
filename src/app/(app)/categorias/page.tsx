'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

interface Categoria { id: string; nome: string; cor: string; icone: string }

const ICONES_DISPONIVEIS = ['home', 'utensils', 'car', 'heart-pulse', 'gamepad-2', 'circle-ellipsis', 'shopping-cart', 'zap', 'wifi', 'book', 'music', 'plane']

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

  async function fetchCategorias() {
    const res = await fetch('/api/categorias')
    setCategorias(await res.json())
  }

  useEffect(() => { fetchCategorias() }, [])

  async function criar() {
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Categoria criada!'); setModal(false); setForm({ nome: '', cor: '#6366f1', icone: 'circle-ellipsis' }); fetchCategorias() }
    else toast.error('Erro ao criar categoria')
  }

  async function deletar(id: string) {
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Removida'); fetchCategorias() }
    else toast.error('Não é possível remover — categoria em uso')
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
                <p className="font-medium text-gray-900 dark:text-white">{cat.nome}</p>
              </div>
              <button onClick={() => deletar(cat.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nova Categoria">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Ex: Educação" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
            <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} className="w-12 h-10 rounded cursor-pointer border border-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONES_DISPONIVEIS.map((icone) => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setForm({ ...form, icone })}
                  className={`p-2 rounded-lg border-2 transition-colors ${form.icone === icone ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                >
                  <DynamicIcon name={icone} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={criar}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

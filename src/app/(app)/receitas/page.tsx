'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface ReceitaFixa { id: string; descricao: string; valor: number; diaDoMes: number }
interface ReceitaVariavel { id: string; descricao: string; valor: number; data: string }

export default function ReceitasPage() {
  const { mes: mesAtual, ano: anoAtual } = getCurrentMonth()
  const [mes, setMes] = useState(mesAtual)
  const [ano, setAno] = useState(anoAtual)
  const [fixas, setFixas] = useState<ReceitaFixa[]>([])
  const [variaveis, setVariaveis] = useState<ReceitaVariavel[]>([])
  const [modalFixa, setModalFixa] = useState(false)
  const [modalVariavel, setModalVariavel] = useState(false)
  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '', diaDoMes: '1' })
  const [formVariavel, setFormVariavel] = useState({ descricao: '', valor: '', data: '' })

  const fetchFixas = useCallback(async () => {
    const res = await fetch('/api/receitas/fixas')
    setFixas(await res.json())
  }, [])

  const fetchVariaveis = useCallback(async () => {
    const res = await fetch(`/api/receitas/variaveis?mes=${mes}&ano=${ano}`)
    setVariaveis(await res.json())
  }, [mes, ano])

  useEffect(() => { fetchFixas(); fetchVariaveis() }, [fetchFixas, fetchVariaveis])

  const totalFixas = fixas.reduce((s, r) => s + r.valor, 0)
  const totalVariaveis = variaveis.reduce((s, r) => s + r.valor, 0)

  async function criarFixa() {
    const res = await fetch('/api/receitas/fixas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: formFixa.descricao, valor: Number(formFixa.valor), diaDoMes: Number(formFixa.diaDoMes) }),
    })
    if (res.ok) { toast.success('Receita fixa criada!'); setModalFixa(false); setFormFixa({ descricao: '', valor: '', diaDoMes: '1' }); fetchFixas() }
    else toast.error('Erro ao criar receita')
  }

  async function criarVariavel() {
    const res = await fetch('/api/receitas/variaveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: formVariavel.descricao, valor: Number(formVariavel.valor), data: formVariavel.data }),
    })
    if (res.ok) { toast.success('Receita lançada!'); setModalVariavel(false); setFormVariavel({ descricao: '', valor: '', data: '' }); fetchVariaveis() }
    else toast.error('Erro ao lançar receita')
  }

  async function deletarFixa(id: string) {
    await fetch(`/api/receitas/fixas/${id}`, { method: 'DELETE' })
    toast.success('Removida'); fetchFixas()
  }

  async function deletarVariavel(id: string) {
    await fetch(`/api/receitas/variaveis/${id}`, { method: 'DELETE' })
    toast.success('Removida'); fetchVariaveis()
  }

  return (
    <>
      <Header title="Receitas">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </Header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-emerald-500" />
          <div>
            <p className="text-sm text-gray-500">Total de receitas do mês</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalFixas + totalVariaveis)}</p>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Receitas Fixas</h3>
            <Button size="sm" variant="secondary" onClick={() => setModalFixa(true)}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
            {fixas.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma receita fixa cadastrada</p>}
            {fixas.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.descricao}</p>
                  <p className="text-xs text-gray-500">Todo dia {r.diaDoMes}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">{formatCurrency(r.valor)}</span>
                  <button onClick={() => deletarFixa(r.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {fixas.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-emerald-600">Subtotal: {formatCurrency(totalFixas)}</span>
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Receitas Variáveis</h3>
            <Button size="sm" variant="secondary" onClick={() => setModalVariavel(true)}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
            {variaveis.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma receita variável neste mês</p>}
            {variaveis.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.descricao}</p>
                  <p className="text-xs text-gray-500">{new Date(r.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">{formatCurrency(r.valor)}</span>
                  <button onClick={() => deletarVariavel(r.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {variaveis.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-emerald-600">Subtotal: {formatCurrency(totalVariaveis)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={modalFixa} onClose={() => setModalFixa(false)} title="Nova Receita Fixa">
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Salário" value={formFixa.descricao} onChange={(e) => setFormFixa({ ...formFixa, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formFixa.valor} onChange={(e) => setFormFixa({ ...formFixa, valor: e.target.value })} />
          <Input label="Dia do mês" type="number" min="1" max="31" value={formFixa.diaDoMes} onChange={(e) => setFormFixa({ ...formFixa, diaDoMes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalFixa(false)}>Cancelar</Button>
            <Button onClick={criarFixa}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalVariavel} onClose={() => setModalVariavel(false)} title="Nova Receita Variável">
        <div className="space-y-4">
          <Input label="Descrição" placeholder="Ex: Freelance" value={formVariavel.descricao} onChange={(e) => setFormVariavel({ ...formVariavel, descricao: e.target.value })} />
          <Input label="Valor (R$)" type="number" step="0.01" value={formVariavel.valor} onChange={(e) => setFormVariavel({ ...formVariavel, valor: e.target.value })} />
          <Input label="Data" type="date" value={formVariavel.data} onChange={(e) => setFormVariavel({ ...formVariavel, data: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalVariavel(false)}>Cancelar</Button>
            <Button onClick={criarVariavel}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SeletorMes } from '@/components/ui/SeletorMes'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, getCurrentMonth } from '@/lib/utils'
import { Plus, Trash2, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

interface Categoria { id: string; nome: string; cor: string; icone: string }
interface Cartao { id: string; nome: string }
interface DespesaFixa { id: string; descricao: string; valor: number; diaDoMes: number; categoria: Categoria; cartao: Cartao | null }
interface DespesaVariavel { id: string; descricao: string; valor: number; data: string; categoria: Categoria; cartao: Cartao | null }

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
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '', diaDoMes: '1', categoriaId: '', cartaoId: '' })
  const [formVariavel, setFormVariavel] = useState({ descricao: '', valor: '', data: '', categoriaId: '', cartaoId: '' })

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

  const totalFixas = fixas.reduce((s, d) => s + d.valor, 0)
  const totalVariaveis = variaveis.reduce((s, d) => s + d.valor, 0)

  async function criarFixa() {
    const res = await fetch('/api/despesas/fixas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formFixa, valor: Number(formFixa.valor), diaDoMes: Number(formFixa.diaDoMes) }),
    })
    if (res.ok) { toast.success('Despesa fixa criada!'); setModalFixa(false); setFormFixa({ descricao: '', valor: '', diaDoMes: '1', categoriaId: '', cartaoId: '' }); fetchFixas() }
    else toast.error('Erro ao criar despesa')
  }

  async function criarVariavel() {
    const res = await fetch('/api/despesas/variaveis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formVariavel, valor: Number(formVariavel.valor), data: formVariavel.data }),
    })
    if (res.ok) { toast.success('Despesa lançada!'); setModalVariavel(false); setFormVariavel({ descricao: '', valor: '', data: '', categoriaId: '', cartaoId: '' }); fetchVariaveis() }
    else toast.error('Erro ao lançar despesa')
  }

  async function deletarFixa(id: string) {
    await fetch(`/api/despesas/fixas/${id}`, { method: 'DELETE' })
    toast.success('Removida'); fetchFixas()
  }

  async function deletarVariavel(id: string) {
    await fetch(`/api/despesas/variaveis/${id}`, { method: 'DELETE' })
    toast.success('Removida'); fetchVariaveis()
  }

  return (
    <>
      <Header title="Despesas">
        <SeletorMes mes={mes} ano={ano} onChange={(m, a) => { setMes(m); setAno(a) }} />
      </Header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="flex items-center gap-4">
          <TrendingDown className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Total de despesas do mês</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalFixas + totalVariaveis)}</p>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Despesas Fixas</h3>
            <Button size="sm" variant="secondary" onClick={() => setModalFixa(true)}><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
            {fixas.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma despesa fixa cadastrada</p>}
            {fixas.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge color={d.categoria.cor}>{d.categoria.nome}</Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.descricao}</p>
                    <p className="text-xs text-gray-500">Vence dia {d.diaDoMes}{d.cartao ? ` · ${d.cartao.nome}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-red-500">{formatCurrency(d.valor)}</span>
                  <button onClick={() => deletarFixa(d.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {fixas.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-red-500">Subtotal: {formatCurrency(totalFixas)}</span>
              </div>
            )}
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Despesas Variáveis</h3>
            <div className="flex items-center gap-2">
              <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5">
                <option value="">Todas categorias</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <Button size="sm" variant="secondary" onClick={() => setModalVariavel(true)}><Plus className="w-4 h-4" /> Adicionar</Button>
            </div>
          </div>
          <Card className="divide-y divide-gray-100 dark:divide-gray-800 p-0 overflow-hidden">
            {variaveis.length === 0 && <p className="p-4 text-sm text-gray-400">Nenhuma despesa variável neste mês</p>}
            {variaveis.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Badge color={d.categoria.cor}>{d.categoria.nome}</Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.descricao}</p>
                    <p className="text-xs text-gray-500">{new Date(d.data).toLocaleDateString('pt-BR')}{d.cartao ? ` · ${d.cartao.nome}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-red-500">{formatCurrency(d.valor)}</span>
                  <button onClick={() => deletarVariavel(d.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {variaveis.length > 0 && (
              <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-semibold text-red-500">Subtotal: {formatCurrency(totalVariaveis)}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={modalFixa} onClose={() => setModalFixa(false)} title="Nova Despesa Fixa">
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
            <Button variant="secondary" onClick={() => setModalFixa(false)}>Cancelar</Button>
            <Button onClick={criarFixa}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={modalVariavel} onClose={() => setModalVariavel(false)} title="Nova Despesa Variável">
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
            <Button variant="secondary" onClick={() => setModalVariavel(false)}>Cancelar</Button>
            <Button onClick={criarVariavel}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

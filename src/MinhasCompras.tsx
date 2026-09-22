import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { CompraType } from './utils/CompraType'
import { useClienteStore } from './context/ClienteContext'

const statusInfo: Record<string, { texto: string; classe: string }> = {
    Pendente: { texto: "Aguardando resposta", classe: "bg-yellow-100 text-yellow-800" },
    Aceita: { texto: "Aceita", classe: "bg-emerald-100 text-emerald-800" },
    Recusada: { texto: "Recusada", classe: "bg-red-100 text-red-800" },
}

export default function MinhasCompras() {
    const cliente = useClienteStore((state) => state.cliente)
    const [compras, setCompras] = useState<CompraType[]>([])
    const [carregando, setCarregando] = useState(true)

    // edição inline da proposta (só quantidade + observação, só Pendente)
    const [editandoId, setEditandoId] = useState<number | null>(null)
    const [quantidadeForm, setQuantidadeForm] = useState(1)
    const [observacaoForm, setObservacaoForm] = useState('')
    const [salvandoId, setSalvandoId] = useState<number | null>(null)
    const [cancelandoId, setCancelandoId] = useState<number | null>(null)

    useEffect(() => {
        if (!cliente.id) {
            setCarregando(false)
            return
        }

        fetch(`${import.meta.env.VITE_API_URL}/compras/${cliente.id}`)
            .then((resposta) => resposta.json())
            .then((dados) => setCompras(Array.isArray(dados) ? dados : []))
            .finally(() => setCarregando(false))
    }, [cliente.id])

    function abrirEdicao(compra: CompraType) {
        setEditandoId(compra.id)
        setQuantidadeForm(compra.quantidade)
        setObservacaoForm(compra.observacao ?? '')
    }

    function fecharEdicao() {
        setEditandoId(null)
        setObservacaoForm('')
    }

    async function salvarEdicao(id: number) {
        setSalvandoId(id)
        try {
            const req = await fetch(`${import.meta.env.VITE_API_URL}/compras/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: cliente.id,
                    quantidade: quantidadeForm,
                    observacao: observacaoForm.trim() || undefined,
                }),
            })

            const corpo = await req.json()

            if (!req.ok) {
                toast.error(corpo.erro ?? 'Não foi possível editar a proposta')
                return
            }

            toast.success('Proposta atualizada')
            setCompras((atual) => atual.map((item) => (item.id === id ? corpo : item)))
            fecharEdicao()
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setSalvandoId(null)
        }
    }

    async function cancelarProposta(id: number) {
        if (!confirm('Cancelar esta proposta? Essa ação não pode ser desfeita.')) {
            return
        }

        setCancelandoId(id)
        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/compras/${id}/cancelar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clienteId: cliente.id }),
            })

            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => null)
                toast.error(corpo?.erro ?? 'Não foi possível cancelar a proposta')
                return
            }

            toast.success('Proposta cancelada')
            setCompras((atual) => atual.filter((item) => item.id !== id))
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setCancelandoId(null)
        }
    }

    if (!cliente.id) {
        return (
            <div className="max-w-3xl mx-auto mt-16 text-center text-gray-500">
                <Link to="/login" className="text-couro font-semibold hover:underline">Faça login</Link> pra ver suas propostas de compra.
            </div>
        )
    }

    if (carregando) {
        return <p className="text-center text-gray-500 mt-16">Carregando...</p>
    }

    if (compras.length === 0) {
        return <p className="text-center text-gray-500 mt-16">Você ainda não fez nenhuma proposta.</p>
    }

    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-16">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Minhas Compras</h1>

            <div className="flex flex-col gap-4">
                {compras.map((compra) => {
                    const info = statusInfo[compra.status] ?? { texto: compra.status, classe: "bg-gray-100 text-gray-800" }
                    const podeEditar = compra.status === 'Pendente'

                    return (
                        <div key={compra.id} className="border rounded-lg p-4 flex gap-4">
                            <img
                                src={compra.livro?.fotos?.[0]?.url ?? "/vite.svg"}
                                alt={`Capa de ${compra.livro?.titulo}`}
                                className="w-16 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="font-semibold">{compra.livro?.titulo}</h2>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.classe}`}>
                                            {info.texto}
                                        </span>
                                        {podeEditar && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEdicao(compra)}
                                                    aria-label="Editar proposta"
                                                    title="Editar proposta"
                                                    className="text-gray-400 hover:text-couro"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={cancelandoId === compra.id}
                                                    onClick={() => cancelarProposta(compra.id)}
                                                    aria-label="Excluir proposta"
                                                    title="Excluir proposta"
                                                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48 48 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48 48 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {editandoId === compra.id ? (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <label className="text-sm text-gray-600">
                                            Quantidade
                                            <input
                                                type="number"
                                                min={1}
                                                value={quantidadeForm}
                                                onChange={(evento) => setQuantidadeForm(Number(evento.target.value))}
                                                className="mt-1 w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </label>
                                        <label className="text-sm text-gray-600">
                                            Observação
                                            <textarea
                                                value={observacaoForm}
                                                onChange={(evento) => setObservacaoForm(evento.target.value)}
                                                rows={2}
                                                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={salvandoId === compra.id || quantidadeForm < 1}
                                                onClick={() => salvarEdicao(compra.id)}
                                                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={fecharEdicao}
                                                className="text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500">Quantidade: {compra.quantidade}</p>
                                        {compra.observacao && (
                                            <p className="text-sm text-gray-600 mt-1">Sua mensagem: {compra.observacao}</p>
                                        )}
                                    </>
                                )}

                                {compra.resposta && (
                                    <p className="text-sm text-gray-700 mt-1 italic">Resposta do admin: {compra.resposta}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

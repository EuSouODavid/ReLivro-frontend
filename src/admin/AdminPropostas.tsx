import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { CompraType } from '../utils/CompraType'

// Tela "Propostas" (admin): lista as propostas Pendentes (GET
// /compras?status=Pendente) e permite aceitar ou recusar (com
// justificativa opcional) via PUT /compras/:id.
export default function AdminPropostas() {
    const [propostas, setPropostas] = useState<CompraType[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)
    const [recusandoId, setRecusandoId] = useState<number | null>(null)
    const [justificativa, setJustificativa] = useState('')
    const [enviandoId, setEnviandoId] = useState<number | null>(null)

    function buscaPropostas() {
        setCarregando(true)
        setErro(false)
        fetch(`${import.meta.env.VITE_API_URL}/compras?status=Pendente`)
            .then((resposta) => {
                if (!resposta.ok) throw new Error('Falha ao buscar propostas')
                return resposta.json()
            })
            .then((dados: CompraType[]) => setPropostas(dados))
            .catch(() => setErro(true))
            .finally(() => setCarregando(false))
    }

    useEffect(() => {
        buscaPropostas()
    }, [])

    async function responder(id: number, status: 'Aceita' | 'Recusada', resposta?: string) {
        setEnviandoId(id)
        try {
            const req = await fetch(`${import.meta.env.VITE_API_URL}/compras/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, resposta: resposta?.trim() || undefined }),
            })

            const corpo = await req.json()

            if (!req.ok) {
                toast.error(corpo.erro ?? 'Não foi possível responder a proposta')
                return
            }

            toast.success(status === 'Aceita' ? 'Proposta aceita!' : 'Proposta recusada')
            setPropostas((atual) => atual.filter((item) => item.id !== id))
            setRecusandoId(null)
            setJustificativa('')
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setEnviandoId(null)
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Propostas
            </h1>

            {carregando && <p className="text-gray-500 dark:text-gray-400">Carregando...</p>}

            {!carregando && erro && (
                <p className="text-red-600 dark:text-red-400">
                    Não foi possível carregar as propostas.
                </p>
            )}

            {!carregando && !erro && propostas.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma proposta pendente no momento.
                </p>
            )}

            {!carregando && !erro && propostas.length > 0 && (
                <div className="flex flex-col gap-3">
                    {propostas.map((proposta) => (
                        <div
                            key={proposta.id}
                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {proposta.livro.titulo}{' '}
                                    <span className="font-normal text-gray-500 dark:text-gray-400">
                                        — Quantidade Solicitada: {proposta.quantidade}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {proposta.cliente?.nome} · {proposta.cliente?.cidade}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(proposta.createdAt).toLocaleDateString('pt-br')}
                                </p>
                                {proposta.observacao && (
                                    <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-300">
                                        "{proposta.observacao}"
                                    </p>
                                )}
                            </div>

                            {recusandoId === proposta.id ? (
                                <div className="mt-3 flex flex-col gap-2">
                                    <textarea
                                        value={justificativa}
                                        onChange={(evento) => setJustificativa(evento.target.value)}
                                        placeholder="Justificativa (opcional)"
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={enviandoId === proposta.id}
                                            onClick={() => responder(proposta.id, 'Recusada', justificativa)}
                                            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecusandoId(null)
                                                setJustificativa('')
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        disabled={enviandoId === proposta.id}
                                        onClick={() => responder(proposta.id, 'Aceita')}
                                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                                    >
                                        Aceitar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={enviandoId === proposta.id}
                                        onClick={() => setRecusandoId(proposta.id)}
                                        className="rounded-lg border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                                    >
                                        Recusar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

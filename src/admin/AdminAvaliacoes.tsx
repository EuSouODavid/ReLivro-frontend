import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { AvaliacaoType } from '../utils/AvaliacaoType'
import type { LivroType } from '../utils/LivroType'
import { adminFetch } from './adminApi'

export default function AdminAvaliacoes() {
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoType[]>([])
    const [termoBusca, setTermoBusca] = useState('')
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)
    const [removendoId, setRemovendoId] = useState<number | null>(null)

    useEffect(() => {
        async function buscarAvaliacoes() {
            try {
                const respostaLivros = await adminFetch(`${import.meta.env.VITE_API_URL}/livros`)

                if (!respostaLivros.ok) {
                    throw new Error('Falha ao buscar livros')
                }

                const livros: LivroType[] = await respostaLivros.json()

                const listas = await Promise.all(
                    livros.map(async (livro) => {
                        const respostaAvaliacoes = await adminFetch(`${import.meta.env.VITE_API_URL}/livros/${livro.id}/avaliacoes`)

                        if (!respostaAvaliacoes.ok) {
                            return []
                        }

                        const dados: AvaliacaoType[] = await respostaAvaliacoes.json()

                        return dados.map((avaliacao) => ({
                            ...avaliacao,
                            livro: avaliacao.livro ?? {
                                id: livro.id,
                                titulo: livro.titulo,
                                autor: livro.autor,
                            },
                        }))
                    })
                )

                setAvaliacoes(listas.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            } catch {
                setErro(true)
            } finally {
                setCarregando(false)
            }
        }

        buscarAvaliacoes()
    }, [])

    async function excluir(id: number) {
        if (!confirm('Excluir esta avaliação? Essa ação não pode ser desfeita.')) {
            return
        }

        setRemovendoId(id)

        try {
            const resposta = await adminFetch(`${import.meta.env.VITE_API_URL}/avaliacoes/${id}`, {
                method: 'DELETE',
            })

            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => null)
                toast.error(corpo?.erro ?? 'Não foi possível excluir a avaliação')
                return
            }

            toast.success('Avaliação excluída')
            setAvaliacoes((atual) => atual.filter((avaliacao) => avaliacao.id !== id))
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setRemovendoId(null)
        }
    }

    const avaliacoesFiltradas = avaliacoes.filter((avaliacao) => {
        const textoBusca = termoBusca.trim().toLowerCase()

        if (!textoBusca) return true

        return (
            avaliacao.livro?.titulo?.toLowerCase().includes(textoBusca) ||
            avaliacao.cliente?.nome?.toLowerCase().includes(textoBusca)
        )
    })

    return (
        <div>
            <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Avaliações
            </h1>

            <div className="mb-4">
                <input
                    type="text"
                    value={termoBusca}
                    onChange={(evento) => setTermoBusca(evento.target.value)}
                    placeholder="Buscar livro ou cliente..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-couro dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
            </div>

            {carregando && <p className="text-gray-500 dark:text-gray-400">Carregando...</p>}

            {!carregando && erro && (
                <p className="text-red-600 dark:text-red-400">
                    Não foi possível carregar as avaliações.
                </p>
            )}

            {!carregando && !erro && avaliacoesFiltradas.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                    {termoBusca ? 'Nenhuma avaliação encontrada para a busca informada.' : 'Nenhuma avaliação registrada ainda.'}
                </p>
            )}

            {!carregando && !erro && avaliacoesFiltradas.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full bg-white text-left text-sm dark:bg-gray-800">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                <th className="px-4 py-2 font-medium">Livro</th>
                                <th className="px-4 py-2 font-medium">Cliente</th>
                                <th className="px-4 py-2 font-medium">Nota</th>
                                <th className="px-4 py-2 font-medium">Comentário</th>
                                <th className="px-4 py-2 font-medium">Data</th>
                                <th className="px-4 py-2 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {avaliacoesFiltradas.map((avaliacao) => (
                                <tr key={avaliacao.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                                        {avaliacao.livro?.titulo ?? 'Livro'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                        {avaliacao.cliente?.nome ?? 'Cliente'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                        {avaliacao.nota}/5
                                    </td>
                                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                        {avaliacao.comentario?.trim() || 'Sem comentário'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                        {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            type="button"
                                            disabled={removendoId === avaliacao.id}
                                            onClick={() => excluir(avaliacao.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

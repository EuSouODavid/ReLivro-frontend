import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { LivroType } from './utils/LivroType'
import type { AvaliacaoType } from './utils/AvaliacaoType'
import { useClienteStore } from './context/ClienteContext'

const propostaSchema = z.object({
    quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que zero" }),
    observacao: z.string().max(255).optional(),
})

type PropostaForm = z.infer<typeof propostaSchema>

export default function Detalhes() {
    const { livroId } = useParams()
    const cliente = useClienteStore((state) => state.cliente)
    const [livro, setLivro] = useState<LivroType | null>(null)
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoType[]>([])
    const [minhaAvaliacao, setMinhaAvaliacao] = useState<AvaliacaoType | null>(null)
    const [jaComprouLivro, setJaComprouLivro] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [notaAvaliacao, setNotaAvaliacao] = useState(5)
    const [comentarioAvaliacao, setComentarioAvaliacao] = useState('')
    const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)
    const [excluindoAvaliacao, setExcluindoAvaliacao] = useState(false)
    const [imagemAtiva, setImagemAtiva] = useState<string | null>(null)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PropostaForm>({
        resolver: zodResolver(propostaSchema),
        defaultValues: { quantidade: 1 },
    })

    useEffect(() => {
        setImagemAtiva(null)

        fetch(`${import.meta.env.VITE_API_URL}/livros/${livroId}`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                setLivro(dados)
                setImagemAtiva(Array.isArray(dados?.fotos) && dados.fotos.length > 0 ? dados.fotos[0].url : null)
            })
            .finally(() => setCarregando(false))

        fetch(`${import.meta.env.VITE_API_URL}/livros/${livroId}/avaliacoes`)
            .then((resposta) => resposta.json())
            .then((dados) => setAvaliacoes(Array.isArray(dados) ? dados : []))
            .catch(() => setAvaliacoes([]))
    }, [livroId])

    useEffect(() => {
        if (!cliente.id) {
            setJaComprouLivro(false)
            setMinhaAvaliacao(null)
            return
        }

        fetch(`${import.meta.env.VITE_API_URL}/compras/${cliente.id}`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                const compras = Array.isArray(dados) ? dados : []
                const comprou = compras.some((compra) => compra.livroId === Number(livroId) && compra.status === 'Aceita')
                setJaComprouLivro(comprou)
            })
            .catch(() => setJaComprouLivro(false))

        fetch(`${import.meta.env.VITE_API_URL}/clientes/${cliente.id}/avaliacoes`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                const minhas = Array.isArray(dados) ? dados : []
                const avaliacaoAtual = minhas.find((avaliacao) => avaliacao.livroId === Number(livroId)) ?? null
                setMinhaAvaliacao(avaliacaoAtual)
            })
            .catch(() => setMinhaAvaliacao(null))
    }, [cliente.id, livroId])

    function formatarData(data: string) {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    async function enviarAvaliacao() {
        if (!cliente.id) {
            toast.error('Faça login para avaliar este livro')
            return
        }

        setEnviandoAvaliacao(true)

        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/avaliacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: cliente.id,
                    livroId: Number(livroId),
                    nota: notaAvaliacao,
                    comentario: comentarioAvaliacao.trim() || undefined,
                }),
            })

            const corpo = await resposta.json()

            if (!resposta.ok) {
                const mensagem = typeof corpo?.erro === 'string'
                    ? corpo.erro
                    : corpo?.erro?.issues?.[0]?.message ?? 'Não foi possível enviar a avaliação'

                toast.error(mensagem)
                return
            }

            toast.success('Avaliação enviada com sucesso!')
            setMinhaAvaliacao(corpo)
            setComentarioAvaliacao('')
            setNotaAvaliacao(5)
            setAvaliacoes((atual) => [corpo, ...atual])
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setEnviandoAvaliacao(false)
        }
    }

    async function excluirMinhaAvaliacao() {
        if (!minhaAvaliacao) return

        if (!confirm('Excluir sua avaliação? Essa ação não pode ser desfeita.')) {
            return
        }

        setExcluindoAvaliacao(true)

        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/avaliacoes/${minhaAvaliacao.id}`, {
                method: 'DELETE',
            })

            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => null)
                toast.error(corpo?.erro ?? 'Não foi possível excluir a avaliação')
                return
            }

            toast.success('Avaliação removida com sucesso')
            setMinhaAvaliacao(null)
            setAvaliacoes((atual) => atual.filter((avaliacao) => avaliacao.id !== minhaAvaliacao.id))
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setExcluindoAvaliacao(false)
        }
    }

    async function enviarProposta(dados: PropostaForm) {
        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/compras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: cliente.id,
                    livroId: Number(livroId),
                    quantidade: dados.quantidade,
                    observacao: dados.observacao,
                }),
            })

            const corpo = await resposta.json()

            if (!resposta.ok) {
                toast.error(corpo.erro ?? "Não foi possível enviar a proposta")
                return
            }

            toast.success("Proposta enviada! Acompanhe em 'Minhas Compras'.")
            reset()
        } catch {
            toast.error("Erro de conexão com o servidor")
        }
    }

    if (carregando) {
        return <p className="text-center text-gray-500 mt-16">Carregando...</p>
    }

    if (!livro) {
        return <p className="text-center text-gray-500 mt-16">Livro não encontrado.</p>
    }

    const fotos = livro.fotos ?? []
    const imagemPrincipal = imagemAtiva ?? fotos[0]?.url ?? '/vite.svg'

    return (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-16">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <img
                            src={imagemPrincipal}
                            alt={`Capa do livro ${livro.titulo}`}
                        />
                    </div>

                    {fotos.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-3">
                            {fotos.map((foto, index) => (
                                <button
                                    key={foto.id ?? `${foto.url}-${index}`}
                                    type="button"
                                    onClick={() => {
                                        setImagemAtiva(foto.url)
                                    }}
                                    className={`overflow-hidden rounded-lg border-2 ${imagemPrincipal === foto.url ? 'border-emerald-600' : 'border-transparent'}`}
                                    aria-label={`Ver imagem ${index + 1} do livro`}
                                >
                                    <img
                                        src={foto.url}
                                        alt={`${livro.titulo} - imagem ${index + 1}`}
                                        className="aspect-[3/4] w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{livro.titulo}</h1>
                    <p className="text-gray-500 mb-4">{livro.autor} — {livro.editora}, {livro.ano}</p>
                    <p className="text-sm text-couro font-semibold mb-4">{livro.categoria}</p>

                    {livro.sinopse && livro.sinopse.length > 0 && (
                        <div className="mb-4">
                            <h2 className="font-semibold mb-1">Sinopse</h2>
                            {livro.sinopse.map((paragrafo, i) => (
                                <p key={i} className="text-gray-600 dark:text-gray-400 mb-2">{paragrafo}</p>
                            ))}
                        </div>
                    )}

                    {livro.resumoIA && (
                        <div className="mb-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4">
                            <h2 className="font-semibold mb-1">Resumo (gerado por IA)</h2>
                            <p className="text-gray-600 dark:text-gray-400">{livro.resumoIA}</p>
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-6">{livro.quantidade} exemplar(es) disponível(is)</p>

                    <section className="border-t pt-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Avaliações</h2>
                            <span className="text-sm text-gray-500">{avaliacoes.length} avaliação(ões)</span>
                        </div>

                        {cliente.id && jaComprouLivro && (
                            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Avalie este livro</h3>

                                <div className="mt-3">
                                    <label className="block text-sm font-medium mb-2">Sua nota</label>
                                    <div className="flex gap-2 text-2xl">
                                        {[1, 2, 3, 4, 5].map((estrela) => (
                                            <button
                                                key={estrela}
                                                type="button"
                                                onClick={() => setNotaAvaliacao(estrela)}
                                                className={estrela <= notaAvaliacao ? 'text-yellow-500' : 'text-gray-300'}
                                                aria-label={`Avaliar com ${estrela} estrela${estrela > 1 ? 's' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="block text-sm font-medium mb-1">Comentário (opcional)</label>
                                    <textarea
                                        value={comentarioAvaliacao}
                                        onChange={(evento) => setComentarioAvaliacao(evento.target.value)}
                                        rows={3}
                                        maxLength={255}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="Conte sua experiência com este livro..."
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={enviarAvaliacao}
                                    disabled={enviandoAvaliacao}
                                    className="mt-3 rounded-lg bg-couro px-4 py-2 text-sm font-medium text-white hover:bg-couro-escuro disabled:opacity-50"
                                >
                                    {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                                </button>
                            </div>
                        )}

                        {avaliacoes.length === 0 ? (
                            <p className="text-gray-500">Ainda não há avaliações para este livro.</p>
                        ) : (
                            <div className="space-y-4">
                                {avaliacoes.map((avaliacao) => {
                                    const ehMinhaAvaliacao = avaliacao.id === minhaAvaliacao?.id

                                    return (
                                        <article key={avaliacao.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                            <div className="flex items-center justify-between gap-3">
                                                <strong className="text-gray-900 dark:text-white">
                                                    {avaliacao.cliente?.nome ?? 'Cliente'}
                                                </strong>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-500 text-sm">
                                                        {'★'.repeat(avaliacao.nota)}{'☆'.repeat(5 - avaliacao.nota)}
                                                    </span>
                                                    {ehMinhaAvaliacao && (
                                                        <button
                                                            type="button"
                                                            disabled={excluindoAvaliacao}
                                                            onClick={excluirMinhaAvaliacao}
                                                            className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                                                        >
                                                            Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatarData(avaliacao.createdAt)}
                                            </p>

                                            {ehMinhaAvaliacao && (
                                                <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">Sua avaliação</p>
                                            )}

                                            <p className="mt-3 text-gray-700 dark:text-gray-300">
                                                {avaliacao.comentario?.trim() || 'Sem comentário adicional.'}
                                            </p>
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {cliente.id ? (
                        <form onSubmit={handleSubmit(enviarProposta)} className="border-t pt-4 flex flex-col gap-3 mt-6">
                            <h2 className="font-semibold">Fazer proposta de compra</h2>

                            <div>
                                <label className="block text-sm font-medium mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    min={1}
                                    {...register('quantidade', { valueAsNumber: true })}
                                    className="w-24 border rounded-lg px-3 py-2"
                                />
                                {errors.quantidade && <p className="text-red-600 text-sm mt-1">{errors.quantidade.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Observação (opcional)</label>
                                <textarea
                                    {...register('observacao')}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows={2}
                                    placeholder="Ex: tenho interesse, aceito combinar a retirada..."
                                />
                                {errors.observacao && <p className="text-red-600 text-sm mt-1">{errors.observacao.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-couro text-white rounded-lg px-4 py-2 hover:bg-couro-escuro transition-colors disabled:opacity-50 w-fit"
                            >
                                {isSubmitting ? "Enviando..." : "Enviar proposta"}
                            </button>
                        </form>
                    ) : (
                        <p className="border-t pt-4 text-gray-500 mt-6">
                            <Link to="/login" className="text-couro font-semibold hover:underline">Faça login</Link> pra enviar uma proposta de compra.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { LivroType } from './utils/LivroType'
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
    const [carregando, setCarregando] = useState(true)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PropostaForm>({
        resolver: zodResolver(propostaSchema),
        defaultValues: { quantidade: 1 },
    })

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/livros/${livroId}`)
            .then((resposta) => resposta.json())
            .then((dados) => setLivro(dados))
            .finally(() => setCarregando(false))
    }, [livroId])

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

    const foto = livro.fotos?.[0]?.url

    return (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-16">
            <div className="grid md:grid-cols-2 gap-8">
                <img
                    src={foto ?? "/vite.svg"}
                    alt={`Capa do livro ${livro.titulo}`}
                    className="rounded-lg w-full h-96 object-cover"
                />

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

                    {cliente.id ? (
                        <form onSubmit={handleSubmit(enviarProposta)} className="border-t pt-4 flex flex-col gap-3">
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
                        <p className="border-t pt-4 text-gray-500">
                            <Link to="/login" className="text-couro font-semibold hover:underline">Faça login</Link> pra enviar uma proposta de compra.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
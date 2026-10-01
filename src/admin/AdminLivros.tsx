import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { adminFetch } from './adminApi'

const livroSchema = z.object({
    titulo: z.string().trim().min(2, 'Informe um título com pelo menos 2 caracteres'),
    autor: z.string().trim().min(2, 'Informe um autor com pelo menos 2 caracteres'),
    categoria: z.string().trim().min(2, 'Informe uma categoria com pelo menos 2 caracteres'),
    quantidade: z.string().trim().min(1, 'Informe uma quantidade').regex(/^\d+$/, 'Informe uma quantidade inteira'),
    editora: z.string().trim().optional(),
    ano: z.string().trim().optional(),
    sinopse: z.string().trim().optional(),
})

type LivroForm = z.infer<typeof livroSchema>

type LivroCriado = {
    id?: number
    titulo?: string
    autor?: string
    categoria?: string
    quantidade?: number
    editora?: string
    ano?: number
    sinopse?: string[]
}

type LivroApi = {
    id: number
    titulo: string
    autor: string
    categoria: string
    quantidade: number
    editora: string
    ano: number
    sinopse: string[]
}

const valoresPadrao: LivroForm = {
    titulo: '',
    autor: '',
    categoria: '',
    quantidade: '1',
    editora: '',
    ano: '',
    sinopse: '',
}

function converteLivroParaFormulario(livro: LivroApi): LivroForm {
    return {
        titulo: livro.titulo ?? '',
        autor: livro.autor ?? '',
        categoria: livro.categoria ?? '',
        quantidade: String(livro.quantidade ?? 1),
        editora: livro.editora ?? '',
        ano: livro.ano ? String(livro.ano) : '',
        sinopse: Array.isArray(livro.sinopse) ? livro.sinopse.join('\n') : '',
    }
}

export default function AdminLivros() {
    const navigate = useNavigate()
    const [adminId, setAdminId] = useState<string | null>(null)
    const [livros, setLivros] = useState<LivroApi[]>([])
    const [carregandoLivros, setCarregandoLivros] = useState(true)
    const [erroLivros, setErroLivros] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [excluindoId, setExcluindoId] = useState<number | null>(null)
    const [livroCriado, setLivroCriado] = useState<LivroCriado | null>(null)
    const [livroEditando, setLivroEditando] = useState<LivroApi | null>(null)

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LivroForm>({
        resolver: zodResolver(livroSchema),
        defaultValues: valoresPadrao,
    })

    const sinopsePreview = watch('sinopse')

    async function carregarLivros() {
        setCarregandoLivros(true)
        setErroLivros(false)

        try {
            const resposta = await adminFetch(`${import.meta.env.VITE_API_URL}/livros`)

            if (!resposta.ok) {
                throw new Error('Falha ao carregar livros')
            }

            const dados = await resposta.json()
            setLivros(Array.isArray(dados) ? dados : [])
        } catch {
            setErroLivros(true)
        } finally {
            setCarregandoLivros(false)
        }
    }

    useEffect(() => {
        const id = localStorage.getItem('adminKey')

        if (!id) {
            navigate('/admin/login', { replace: true })
            return
        }

        setAdminId(id)
        carregarLivros()
    }, [navigate])

    function iniciarEdicao(livro: LivroApi) {
        setLivroEditando(livro)
        reset(converteLivroParaFormulario(livro))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function cancelarEdicao() {
        setLivroEditando(null)
        reset(valoresPadrao)
    }

    async function cadastrarLivro(dados: LivroForm) {
        if (!adminId) {
            toast.error('Faça login novamente como administrador')
            navigate('/admin/login', { replace: true })
            return
        }

        setEnviando(true)

        const sinopse = dados.sinopse
            ? dados.sinopse
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean)
            : undefined

        const payload = {
            titulo: dados.titulo.trim(),
            autor: dados.autor.trim(),
            categoria: dados.categoria.trim(),
            quantidade: Number(dados.quantidade),
            adminId,
            editora: dados.editora?.trim() || undefined,
            ano: dados.ano?.trim() ? Number(dados.ano) : undefined,
            sinopse: sinopse?.length ? sinopse : undefined,
        }

        try {
            const url = livroEditando
                ? `${import.meta.env.VITE_API_URL}/livros/${livroEditando.id}`
                : `${import.meta.env.VITE_API_URL}/livros`

            const resposta = await adminFetch(url, {
                method: livroEditando ? 'PUT' : 'POST',
                body: JSON.stringify(livroEditando ? payload : payload),
            })

            const corpo = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                toast.error(
                    corpo?.erro
                        ? (livroEditando ? 'Não foi possível atualizar o livro' : 'Não foi possível cadastrar o livro')
                        : (livroEditando ? 'Erro ao atualizar o livro' : 'Erro ao cadastrar o livro')
                )
                return
            }

            if (livroEditando) {
                toast.success('Livro atualizado com sucesso')
                setLivroEditando(null)
            } else {
                toast.success('Livro cadastrado com sucesso')
                setLivroCriado(corpo)
            }

            reset(valoresPadrao)
            await carregarLivros()
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setEnviando(false)
        }
    }

    async function excluirLivro(livro: LivroApi) {
        if (!confirm(`Excluir o livro "${livro.titulo}"? Essa ação não pode ser desfeita.`)) {
            return
        }

        setExcluindoId(livro.id)

        try {
            const resposta = await adminFetch(`${import.meta.env.VITE_API_URL}/livros/${livro.id}`, {
                method: 'DELETE',
            })

            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => null)
                toast.error(corpo?.erro ? 'Não foi possível excluir o livro' : 'Erro ao excluir o livro')
                return
            }

            toast.success('Livro excluído com sucesso')
            setLivros((atual) => atual.filter((item) => item.id !== livro.id))

            if (livroEditando?.id === livro.id) {
                cancelarEdicao()
            }
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setExcluindoId(null)
        }
    }

    return (
        <>
            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {livroEditando ? 'Editar livro' : 'Cadastro de livros'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Somente administradores autenticados podem criar, editar ou excluir itens do catálogo.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(cadastrarLivro)}
                    className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Título
                            </label>
                            <input
                                type="text"
                                {...register('titulo')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Autor
                            </label>
                            <input
                                type="text"
                                {...register('autor')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.autor && <p className="mt-1 text-sm text-red-600">{errors.autor.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Categoria
                            </label>
                            <input
                                type="text"
                                {...register('categoria')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quantidade
                            </label>
                            <input
                                type="number"
                                min="1"
                                {...register('quantidade')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                            {errors.quantidade && <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Editora (opcional)
                            </label>
                            <input
                                type="text"
                                {...register('editora')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ano (opcional)
                            </label>
                            <input
                                type="number"
                                min="1"
                                {...register('ano')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sinopse (opcional)
                        </label>
                        <textarea
                            rows={5}
                            {...register('sinopse')}
                            placeholder="Digite uma frase por linha para montar a lista de sinopse"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {sinopsePreview?.trim()
                                ? 'O backend receberá a sinopse como uma lista de linhas.'
                                : 'Opcional. Se vazio, o backend pode completar os dados automaticamente.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {livroEditando
                                ? `Editando o livro #${livroEditando.id}`
                                : 'Preencha os campos para cadastrar um novo livro.'}
                        </div>

                        <div className="flex gap-3">
                            {livroEditando && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicao}
                                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    Cancelar edição
                                </button>
                            )}

                        <button
                            type="submit"
                            disabled={enviando}
                            className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                                {enviando
                                    ? (livroEditando ? 'Salvando...' : 'Cadastrando...')
                                    : (livroEditando ? 'Salvar alterações' : 'Cadastrar livro')}
                        </button>
                        </div>
                    </div>
                </form>

                <section className="mt-10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Livros cadastrados
                        </h2>
                        <button
                            type="button"
                            onClick={carregarLivros}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Atualizar lista
                        </button>
                    </div>

                    {carregandoLivros && <p className="text-gray-500 dark:text-gray-400">Carregando livros...</p>}

                    {!carregandoLivros && erroLivros && (
                        <p className="text-red-600 dark:text-red-400">
                            Não foi possível carregar os livros.
                        </p>
                    )}

                    {!carregandoLivros && !erroLivros && livros.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400">
                            Nenhum livro cadastrado ainda.
                        </p>
                    )}

                    {!carregandoLivros && !erroLivros && livros.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                        <th className="px-4 py-3 font-medium">Título</th>
                                        <th className="px-4 py-3 font-medium">Autor</th>
                                        <th className="px-4 py-3 font-medium">Categoria</th>
                                        <th className="px-4 py-3 font-medium">Qtd.</th>
                                        <th className="px-4 py-3 font-medium">Editora</th>
                                        <th className="px-4 py-3 font-medium">Ano</th>
                                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {livros.map((livro) => (
                                        <tr key={livro.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white">{livro.titulo}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{livro.autor}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{livro.categoria}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{livro.quantidade}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{livro.editora || 'Não informada'}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{livro.ano || 'Não informado'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => iniciarEdicao(livro)}
                                                        className="rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={excluindoId === livro.id}
                                                        onClick={() => excluirLivro(livro)}
                                                        className="rounded-lg border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                                                    >
                                                        {excluindoId === livro.id ? 'Excluindo...' : 'Excluir'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {livroCriado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Livro cadastrado
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            O registro foi criado com sucesso. Confira os dados abaixo.
                        </p>

                        <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <p><span className="font-semibold">ID:</span> {livroCriado.id ?? 'Sem ID retornado'}</p>
                            <p><span className="font-semibold">Título:</span> {livroCriado.titulo ?? '-'}</p>
                            <p><span className="font-semibold">Autor:</span> {livroCriado.autor ?? '-'}</p>
                            <p><span className="font-semibold">Categoria:</span> {livroCriado.categoria ?? '-'}</p>
                            <p><span className="font-semibold">Quantidade:</span> {livroCriado.quantidade ?? '-'}</p>
                            <p><span className="font-semibold">Editora:</span> {livroCriado.editora ?? 'Não informada'}</p>
                            <p><span className="font-semibold">Ano:</span> {livroCriado.ano ?? 'Não informado'}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setLivroCriado(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
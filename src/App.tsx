import { useEffect, useState } from 'react'
import { CardLivro } from './components/CardLivro'
import type { LivroType } from './utils/LivroType'

export default function App() {
    const [livros, setLivros] = useState<LivroType[]>([])
    const [termo, setTermo] = useState('')
    const [carregando, setCarregando] = useState(true)

    async function buscarLivros(termoBusca?: string) {
        setCarregando(true)
        try {
            const url = termoBusca
                ? `${import.meta.env.VITE_API_URL}/livros/pesquisa/${encodeURIComponent(termoBusca)}`
                : `${import.meta.env.VITE_API_URL}/livros`

            const resposta = await fetch(url)
            const dados = await resposta.json()
            setLivros(Array.isArray(dados) ? dados : [])
        } catch {
            setLivros([])
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        buscarLivros()
    }, [])

    function handleBusca(evento: React.FormEvent) {
        evento.preventDefault()
        buscarLivros(termo || undefined)
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="mb-4 mt-8 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl dark:text-white">
                Nossos{" "}
                <span className="underline underline-offset-4 decoration-8 decoration-emerald-400">
                    Livros
                </span>
            </h1>

            <form onSubmit={handleBusca} className="flex gap-2 mb-8 max-w-md">
                <input
                    type="text"
                    placeholder="Buscar por título, autor ou categoria..."
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                    type="submit"
                    className="bg-couro text-white rounded-lg px-4 py-2 hover:bg-couro-escuro transition-colors"
                >
                    Buscar
                </button>
            </form>

            {carregando ? (
                <p className="text-gray-500">Carregando livros...</p>
            ) : livros.length === 0 ? (
                <p className="text-gray-500">Nenhum livro encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
                    {livros.map((livro) => (
                        <CardLivro key={livro.id} data={livro} />
                    ))}
                </div>
            )}
        </div>
    )
}
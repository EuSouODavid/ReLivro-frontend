import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { CompraType } from '../utils/CompraType'

// Tela "Vendas" (admin): lista as propostas já Aceitas (GET
// /compras?status=Aceita) e permite excluir o registro via DELETE
// /compras/:id. Só leitura + exclusão — criar/editar fica de fora por
// enquanto (a venda nasce do fluxo de proposta do cliente).
export default function AdminVendas() {
    const [vendas, setVendas] = useState<CompraType[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)
    const [excluindoId, setExcluindoId] = useState<number | null>(null)

    function buscaVendas() {
        setCarregando(true)
        setErro(false)
        fetch(`${import.meta.env.VITE_API_URL}/compras?status=Aceita`)
            .then((resposta) => {
                if (!resposta.ok) throw new Error('Falha ao buscar vendas')
                return resposta.json()
            })
            .then((dados: CompraType[]) => setVendas(dados))
            .catch(() => setErro(true))
            .finally(() => setCarregando(false))
    }

    useEffect(() => {
        buscaVendas()
    }, [])

    async function excluir(id: number) {
        if (!confirm('Excluir este registro de venda? Essa ação não pode ser desfeita.')) {
            return
        }

        setExcluindoId(id)
        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/compras/${id}`, {
                method: 'DELETE',
            })

            if (!resposta.ok) {
                toast.error('Não foi possível excluir a venda')
                return
            }

            toast.success('Venda excluída')
            setVendas((atual) => atual.filter((venda) => venda.id !== id))
        } catch {
            toast.error('Erro de conexão com o servidor')
        } finally {
            setExcluindoId(null)
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Vendas
            </h1>

            {carregando && <p className="text-gray-500 dark:text-gray-400">Carregando...</p>}

            {!carregando && erro && (
                <p className="text-red-600 dark:text-red-400">
                    Não foi possível carregar as vendas.
                </p>
            )}

            {!carregando && !erro && vendas.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma venda registrada ainda.</p>
            )}

            {!carregando && !erro && vendas.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full bg-white text-left text-sm dark:bg-gray-800">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                <th className="px-4 py-2 font-medium">Livro</th>
                                <th className="px-4 py-2 font-medium">Cliente</th>
                                <th className="px-4 py-2 text-right font-medium">Qtd.</th>
                                <th className="px-4 py-2 font-medium">Data</th>
                                <th className="px-4 py-2 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendas.map((venda) => (
                                <tr
                                    key={venda.id}
                                    className="border-b border-gray-100 last:border-0 dark:border-gray-700"
                                >
                                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                                        {venda.livro.titulo}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                        {venda.cliente?.nome}
                                    </td>
                                    <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                                        {venda.quantidade}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                        {new Date(venda.createdAt).toLocaleDateString('pt-br')}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            type="button"
                                            disabled={excluindoId === venda.id}
                                            onClick={() => excluir(venda.id)}
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

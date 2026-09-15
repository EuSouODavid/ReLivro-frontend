import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
                    return (
                        <div key={compra.id} className="border rounded-lg p-4 flex gap-4">
                            <img
                                src={compra.livro?.fotos?.[0]?.url ?? "/vite.svg"}
                                alt={`Capa de ${compra.livro?.titulo}`}
                                className="w-16 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold">{compra.livro?.titulo}</h2>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.classe}`}>
                                        {info.texto}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">Quantidade: {compra.quantidade}</p>
                                {compra.observacao && (
                                    <p className="text-sm text-gray-600 mt-1">Sua mensagem: {compra.observacao}</p>
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
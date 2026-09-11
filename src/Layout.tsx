import { useEffect } from 'react'
import Titulo from './components/Titulo.tsx'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useClienteStore } from './context/ClienteContext'

export default function Layout() {
    const cliente = useClienteStore((state) => state.cliente)
    const logaCliente = useClienteStore((state) => state.logaCliente)

    useEffect(() => {
        const clienteKey = localStorage.getItem('clienteKey')

        if (clienteKey && !cliente.id) {
            fetch(`${import.meta.env.VITE_API_URL}/clientes/${clienteKey}`)
                .then((resposta) => resposta.json())
                .then((dados) => {
                    if (dados?.id) {
                        logaCliente(dados)
                    }
                })
                .catch(() => {
                    localStorage.removeItem('clienteKey')
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Titulo />
            <Outlet />
            <Toaster richColors position="top-center" />
        </>
    )
}
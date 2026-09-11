import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useClienteStore } from "../context/ClienteContext"

export default function Titulo() {
    const { cliente, deslogaCliente } = useClienteStore()
    const navigate = useNavigate()
    const [menuAberto, setMenuAberto] = useState(false)

    function clienteSair() {
        if (confirm("Confirma saída do sistema?")) {
            deslogaCliente()
            if (localStorage.getItem("clienteKey")) {
                localStorage.removeItem("clienteKey")
            }
            navigate("/login")
        }
    }

    return (
        <nav className="bg-emerald-800 dark:bg-emerald-950 shadow-md sticky top-0 z-50">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo-mark.svg" className="h-9" alt="Logo ReLivro" />
                    <span className="text-2xl font-bold tracking-tight text-white">
                        ReLivro
                    </span>
                </Link>

                <button
                    onClick={() => setMenuAberto((aberto) => !aberto)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-white rounded-lg md:hidden hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-couro"
                >
                    <span className="sr-only">Abrir menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>

                <div className={`${menuAberto ? "block" : "hidden"} w-full md:flex md:w-auto md:items-center mt-4 md:mt-0`}>
                    {cliente.id ? (
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-couro font-semibold text-sm text-white">
                                    {cliente.nome.charAt(0).toUpperCase()}
                                </span>
                                <span className="font-medium">{cliente.nome}</span>
                            </div>

                            <Link
                                to="/minhas-compras"
                                className="text-white font-semibold bg-couro hover:bg-couro-escuro focus:ring-2 focus:outline-none focus:ring-couro-escuro rounded-lg text-sm px-4 py-2 text-center transition-colors"
                            >
                                Minhas Compras
                            </Link>

                            <button
                                onClick={clienteSair}
                                className="text-white/90 font-medium text-sm hover:text-white hover:underline transition-colors text-left"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-block bg-couro text-white font-semibold text-sm rounded-lg px-4 py-2 hover:bg-couro-escuro transition-colors"
                        >
                            Identifique-se
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
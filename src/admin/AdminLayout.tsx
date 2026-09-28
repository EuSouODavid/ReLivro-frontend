import { Link, NavLink, Outlet } from 'react-router-dom'

// Árvore de rotas própria do admin (itens 8 em diante do trabalho).
// Login do admin entra aqui na Parte 5 — por enquanto o menu já cobre as
// 3 telas: Dashboard (pronta), Vendas e Propostas (CRUD chega na próxima
// feature; por ora só a tela "em construção" pra o link não cair em 404).
const ITENS_MENU = [
    { rota: 'dashboard', label: 'Dashboard' },
    { rota: 'vendas', label: 'Vendas' },
    { rota: 'propostas', label: 'Propostas' },
]

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-emerald-800 dark:bg-emerald-950 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-white">
                            ReLivro
                        </span>
                        <span className="bg-couro text-white text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-1">
                            Admin
                        </span>
                    </Link>
                    <Link to="/" className="text-sm text-white/80 hover:text-white hover:underline">
                        Voltar à loja
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
                <nav className="md:w-48 shrink-0">
                    <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
                        {ITENS_MENU.map((item) => (
                            <li key={item.rota} className="shrink-0">
                                <NavLink
                                    to={item.rota}
                                    className={({ isActive }) =>
                                        `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-emerald-700 text-white'
                                                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

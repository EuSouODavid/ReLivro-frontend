import { Link, Outlet } from 'react-router-dom'

// Árvore de rotas própria do admin (itens 8 em diante do trabalho).
// Login do admin e o CRUD de livros/compras entram aqui na Parte 5 —
// por enquanto só o cabeçalho e o dashboard.
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
            <Outlet />
        </div>
    )
}

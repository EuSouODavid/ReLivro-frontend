import { useEffect, useState } from 'react'
import type { DashboardType } from '../utils/DashboardType'
import { StatTile } from './components/StatTile'
import { BarChartCard, CORES_GRAFICO } from './components/BarChartCard'
import { StatusBreakdownCard } from './components/StatusBreakdownCard'

// GET /admin/dashboard (backend/src/routes/dashboard.ts): totais + os
// agregados prontos pros gráficos (livros por categoria/autor, propostas
// por status e mais comprados por categoria).
export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState<DashboardType | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`)
            .then((resposta) => {
                if (!resposta.ok) throw new Error('Falha ao buscar dashboard')
                return resposta.json()
            })
            .then((dados: DashboardType) => setDashboard(dados))
            .catch(() => setErro(true))
            .finally(() => setCarregando(false))
    }, [])

    return (
        <div>
            <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Dashboard
            </h1>

            {carregando && <p className="text-gray-500 dark:text-gray-400">Carregando...</p>}

            {!carregando && erro && (
                <p className="text-red-600 dark:text-red-400">
                    Não foi possível carregar os dados do dashboard.
                </p>
            )}

            {!carregando && !erro && dashboard && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatTile label="Clientes" value={dashboard.totais.clientes} />
                        <StatTile label="Livros no catálogo" value={dashboard.totais.livros} />
                        <StatTile label="Propostas" value={dashboard.totais.propostas} />
                    </div>

                    <StatusBreakdownCard porStatus={dashboard.propostasPorStatus} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <BarChartCard
                            titulo="Livros por categoria"
                            dados={dashboard.livrosPorCategoria}
                        />
                        <BarChartCard
                            titulo="Mais comprados por categoria"
                            dados={dashboard.maisCompradosPorCategoria}
                            cor={CORES_GRAFICO.laranja.cor}
                            corHover={CORES_GRAFICO.laranja.corHover}
                        />
                    </div>

                    <BarChartCard
                        titulo="Livros por autor"
                        dados={dashboard.livrosPorAutor.map((item) => ({
                            categoria: item.autor,
                            quantidade: item.quantidade,
                        }))}
                    />
                </div>
            )}
        </div>
    )
}

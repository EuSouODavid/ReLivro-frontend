import { useState } from 'react'
import {
    VictoryChart,
    VictoryBar,
    VictoryAxis,
    VictoryTooltip,
    VictoryVoronoiContainer,
    VictoryLabel,
} from 'victory'


export const CORES_GRAFICO = {
    verde: { cor: '#059669', corHover: '#10b981' },
    laranja: { cor: '#eb6834', corHover: '#f0895c' },
} as const

type ItemGrafico = {
    categoria: string
    quantidade: number
}

type BarChartCardProps = {
    titulo: string
    dados: ItemGrafico[]
    cor?: string
    corHover?: string
}

export function BarChartCard({
    titulo,
    dados,
    cor = CORES_GRAFICO.verde.cor,
    corHover = CORES_GRAFICO.verde.corHover,
}: BarChartCardProps) {
    const [verTabela, setVerTabela] = useState(false)

    const ordenados = [...dados].sort((a, b) => b.quantidade - a.quantidade)
    const altura = Math.max(160, ordenados.length * 40 + 50)

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{titulo}</h3>
                {ordenados.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setVerTabela((v) => !v)}
                        className="text-sm text-gray-500 hover:text-emerald-700 dark:text-gray-400 dark:hover:text-emerald-400 underline underline-offset-2"
                    >
                        {verTabela ? 'Ver gráfico' : 'Ver como tabela'}
                    </button>
                )}
            </div>

            {ordenados.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem dados por enquanto.</p>
            ) : verTabela ? (
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th className="py-1.5 font-medium">{titulo}</th>
                            <th className="py-1.5 font-medium text-right">Quantidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenados.map((item) => (
                            <tr
                                key={item.categoria}
                                className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                                <td className="py-1.5 text-gray-900 dark:text-white">{item.categoria}</td>
                                <td className="py-1.5 text-right text-gray-900 dark:text-white">
                                    {item.quantidade.toLocaleString('pt-br')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ height: altura }}>
                    <VictoryChart
                        horizontal
                        height={altura}
                        domainPadding={{ x: 16 }}
                        padding={{ top: 10, bottom: 30, left: 120, right: 44 }}
                        containerComponent={
                            <VictoryVoronoiContainer
                                voronoiDimension="y"
                                labels={({ datum }) => `${datum.categoria}: ${datum.quantidade.toLocaleString('pt-br')}`}
                                labelComponent={
                                    <VictoryTooltip
                                        flyoutStyle={{ fill: '#111827', stroke: 'none' }}
                                        style={{ fill: '#ffffff', fontSize: 12, fontFamily: 'inherit' }}
                                        flyoutPadding={{ top: 6, bottom: 6, left: 10, right: 10 }}
                                        pointerLength={6}
                                        cornerRadius={4}
                                    />
                                }
                            />
                        }
                    >
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) => Number(t).toLocaleString('pt-br')}
                            style={{
                                axis: { stroke: '#e5e7eb' },
                                tickLabels: { fill: '#6b7280', fontSize: 11, fontFamily: 'inherit' },
                                grid: { stroke: '#e5e7eb', strokeWidth: 1 },
                            }}
                        />
                        <VictoryAxis
                            style={{
                                axis: { stroke: '#e5e7eb' },
                                tickLabels: { fill: '#374151', fontSize: 12, fontFamily: 'inherit' },
                            }}
                        />
                        <VictoryBar
                            data={ordenados}
                            x="categoria"
                            y="quantidade"
                            barWidth={20}
                            cornerRadius={4}
                            style={{
                                data: {
                                    fill: ({ active }) => (active ? corHover : cor),
                                },
                            }}
                            labels={({ datum }) => `${datum.quantidade.toLocaleString('pt-br')}`}
                            labelComponent={
                                <VictoryLabel
                                    dx={8}
                                    style={{ fill: '#111827', fontSize: 12, fontFamily: 'inherit' }}
                                />
                            }
                        />
                    </VictoryChart>
                </div>
            )}
        </div>
    )
}

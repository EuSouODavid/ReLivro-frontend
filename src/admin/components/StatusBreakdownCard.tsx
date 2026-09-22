import type { PropostasPorStatusType } from '../../utils/DashboardType'

// "Propostas por status" é parte-do-todo (3 estados que somam o total de
// propostas), não identidade — então usa a paleta de status do guia de
// dataviz (reservada, nunca reaproveitada como "série 4"), sempre com
// ícone + rótulo: no fundo claro, o amarelo de "Pendente" fica abaixo de
// 3:1 de contraste de propósito, e o ícone + o texto ao lado (não a cor
// isolada) é que carregam o significado.
//   Aceita   -> good     #0ca30c
//   Pendente -> warning  #fab219
//   Recusada -> critical #d03b3b
// (mesmos hexadecimais valem para o fundo claro e o escuro — status é uma
// escala fixa, nunca "temada" como a paleta categórica.)
const STATUS_INFO = [
    { chave: 'Aceita', label: 'Aceita', cor: '#0ca30c' },
    { chave: 'Pendente', label: 'Pendente', cor: '#fab219' },
    { chave: 'Recusada', label: 'Recusada', cor: '#d03b3b' },
] as const

type StatusChave = (typeof STATUS_INFO)[number]['chave']

type StatusBreakdownCardProps = {
    porStatus: PropostasPorStatusType
}

export function StatusBreakdownCard({ porStatus }: StatusBreakdownCardProps) {
    const total = porStatus.Pendente + porStatus.Aceita + porStatus.Recusada

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Propostas por status
            </h3>

            {total === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sem propostas por enquanto.</p>
            ) : (
                <>
                    <div className="flex w-full h-7 rounded-md overflow-hidden">
                        {STATUS_INFO.map(({ chave, label, cor }) => {
                            const quantidade = porStatus[chave]
                            if (quantidade === 0) return null
                            const percentual = (quantidade / total) * 100
                            return (
                                <div
                                    key={chave}
                                    style={{ width: `${percentual}%`, backgroundColor: cor }}
                                    title={`${label}: ${quantidade} (${percentual.toFixed(0)}%)`}
                                    className="h-full border-r-2 border-white last:border-r-0 dark:border-gray-800"
                                />
                            )
                        })}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                        {STATUS_INFO.map(({ chave, label, cor }) => {
                            const quantidade = porStatus[chave]
                            const percentual = (quantidade / total) * 100
                            return (
                                <div key={chave} className="flex items-center gap-2">
                                    <StatusIcon status={chave} cor={cor} />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {label}:{' '}
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {quantidade.toLocaleString('pt-br')}
                                        </span>{' '}
                                        <span className="text-gray-500 dark:text-gray-400">
                                            ({percentual.toFixed(0)}%)
                                        </span>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

function StatusIcon({ status, cor }: { status: StatusChave; cor: string }) {
    if (status === 'Aceita') {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="8" fill={cor} />
                <path
                    d="M4.5 8.2 L7 10.7 L11.5 5.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        )
    }

    if (status === 'Pendente') {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="8" fill={cor} />
                <path
                    d="M8 4.5V8l2.5 1.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        )
    }

    return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill={cor} />
            <path
                d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    )
}

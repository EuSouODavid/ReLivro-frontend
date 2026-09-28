// Stat tile: um número de cabeçalho por cartão, sem gráfico. Usado para
// os contadores do dashboard (nº clientes, nº livros, nº compras).
type StatTileProps = {
    label: string
    value: number
}

export function StatTile({ label, value }: StatTileProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-4xl font-semibold text-gray-900 dark:text-white">
                {value.toLocaleString('pt-br')}
            </p>
        </div>
    )
}

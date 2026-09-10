import { Link } from "react-router-dom"
import type { LivroType } from "../utils/LivroType"

export function CardLivro({ data }: { data: LivroType }) {
    const foto = data.fotos?.[0]?.url

    return (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <img
                className="rounded-t-lg w-full h-56 object-cover"
                src={foto ?? "/vite.svg"}
                alt={`Capa do livro ${data.titulo}`}
            />
            <div className="p-5">
                <h5 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {data.titulo}
                </h5>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                    {data.autor}
                </p>
                <p className="mb-3 font-extrabold text-gray-700 dark:text-gray-300">
                    Preço R$: {Number(data.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                </p>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {data.categoria} - {data.ano}
                </p>
                <Link
                    to={`/detalhes/${data.id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300"
                >
                    Ver Detalhes
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}

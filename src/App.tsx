// Home (rota "/"). A listagem de destaques + busca (itens 1 e 2 do
// trabalho) entram aqui na Parte 2 — por enquanto só o esqueleto da
// página, pra confirmarmos que a navegação está funcionando.
export default function App() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <h1 className="mb-4 mt-8 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl dark:text-white">
                Livros{" "}
                <span className="underline underline-offset-4 decoration-8 decoration-emerald-400">
                    em destaque
                </span>
            </h1>
            <p className="text-gray-500">
                🚧 Em construção — destaques e busca chegam na Parte 2.
            </p>
        </div>
    )
}

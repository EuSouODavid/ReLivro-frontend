// Tela "Propostas" (admin): lista as propostas Pendentes, com ações de
// aceitar/recusar (recusar com justificativa opcional). CRUD chega na
// feature separada (controle de propostas e vendas) — por ora só o
// esqueleto, pra o menu não cair em 404.
export default function AdminPropostas() {
    return (
        <div>
            <h1 className="mb-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Propostas
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
                🚧 Em construção — aceitar/recusar propostas chega na próxima parte.
            </p>
        </div>
    )
}

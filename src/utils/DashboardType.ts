// Formato de GET /admin/dashboard (rota implementada em
// backend/src/routes/dashboard.ts).
export type LivrosPorCategoriaType = {
    categoria: string
    quantidade: number
}

export type LivrosPorAutorType = {
    autor: string
    quantidade: number
}

export type PropostasPorStatusType = {
    Pendente: number
    Aceita: number
    Recusada: number
}

export type DashboardType = {
    totais: {
        clientes: number
        livros: number
        propostas: number
    }
    propostasPorStatus: PropostasPorStatusType
    livrosPorCategoria: LivrosPorCategoriaType[]
    livrosPorAutor: LivrosPorAutorType[]
    maisCompradosPorCategoria: LivrosPorCategoriaType[]
}

import type { LivroType } from "./LivroType"

export type CompraType = {
    id: number
    clienteId: string
    livroId: number
    livro: LivroType
    quantidade: number
    valor: number | null
    observacao?: string
    resposta: string | null
    status: "Pendente" | "Aceita" | "Recusada"
    createdAt: string
    updatedAt: string | null
}
import type { LivroType } from "./LivroType"

// Representa a interação principal do cliente com o livro: uma compra
// (equivalente à tabela "venda" / "item_venda" do seu modelo ER, vistas
// aqui do ponto de vista do cliente que está comprando um livro).
export type CompraType = {
    id: number
    clienteId: string
    livroId: number
    livro: LivroType
    quantidade: number
    valor: number
    observacao?: string
    // null enquanto o admin não responde/confirma a compra
    resposta: string | null
    status: "aguardando" | "aceita" | "recusada"
    createdAt: string
    updatedAt: string | null
}

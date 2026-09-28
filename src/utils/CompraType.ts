import type { LivroType } from "./LivroType"
import type { ClienteType } from "./ClienteType"
 
// Representa a interação principal do cliente com o livro: uma compra
// (equivalente à tabela "venda" / "item_venda" do modelo ER, achatada
// pelo backend em formataCompra()).
export type CompraType = {
    id: number
    clienteId: string
    // só vem preenchido nas rotas do admin (GET /compras), que incluem o
    // cliente na consulta; na rota do próprio cliente (GET /compras/:id)
    // fica undefined.
    cliente?: Pick<ClienteType, "id" | "nome" | "email" | "cidade">
    livroId: number
    livro: LivroType
    quantidade: number
    valor: number
    observacao?: string
    // null enquanto o admin não responde a proposta
    resposta: string | null
    status: "Pendente" | "Aceita" | "Recusada"
    createdAt: string
    updatedAt: string | null
}
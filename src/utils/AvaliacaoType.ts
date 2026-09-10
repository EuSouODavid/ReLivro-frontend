// Tabela "avaliacoes" do seu modelo ER: nota + comentário do cliente
// sobre um livro. Usada mais adiante (após a compra ser confirmada).
export type AvaliacaoType = {
    id: number
    clienteId: string
    livroId: number
    nota: number
    comentario: string
    dataAvaliacao: string
}

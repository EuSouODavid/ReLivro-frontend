import type { FotoType } from "./FotoType"

export type LivroType = {
    id: number
    titulo: string
    autor: string
    editora: string
    ano: number
    categoria: string
    quantidade: number
    // ATENÇÃO: preco e destaque ainda não estão na tabela "livro" do
    // modelo ER que você desenhou (só tem id, titulo, autor, editora,
    // ano, categoria, quantidade, Admin_id). Alinhar com o back-end
    // (seu colega) se esses dois campos serão adicionados na tabela
    // livro ou vêm de outro lugar.
    preco: number
    destaque: boolean
    fotos: FotoType[]
    adminId: number
    createdAt: string
    updatedAt: string
    // Campos preenchidos via consulta a uma IA (item 3 do trabalho)
    resumoIA?: string
    precoSugeridoIA?: number
}

export type AvaliacaoType = {
    id: number
    clienteId: string
    livroId: number
    nota: number
    comentario?: string | null
    createdAt: string
    cliente?: {
        id: string
        nome: string
        email: string
    }
    livro?: {
        id: number
        titulo: string
        autor: string
    }
}

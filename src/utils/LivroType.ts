import type { FotoType } from "./FotoType"

export type LivroType = {
    id: number
    titulo: string
    autor: string
    editora: string
    ano: number
    categoria: string
    quantidade: number
    sinopse?: string[]
    fotos: FotoType[]
    adminId: string
    resumoIA?: string
    precoSugeridoIA?: number
}
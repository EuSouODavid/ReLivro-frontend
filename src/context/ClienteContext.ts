import type { ClienteType } from '../utils/ClienteType'
import { create } from 'zustand'

type ClienteStore = {
    cliente: ClienteType
    logaCliente: (clienteLogado: ClienteType) => void
    deslogaCliente: () => void
}

// Guarda o cliente logado em memória (via zustand) durante a navegação.
// Quem persiste entre acessos (item 5 do trabalho) é o localStorage,
// usado em conjunto com este contexto no App.tsx / Login.tsx.
export const useClienteStore = create<ClienteStore>((set) => ({
    cliente: {} as ClienteType,
    logaCliente: (clienteLogado) => set({ cliente: clienteLogado }),
    deslogaCliente: () => set({ cliente: {} as ClienteType }),
}))

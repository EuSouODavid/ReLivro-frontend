import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const cadastroSchema = z.object({
    nome: z.string().min(10, { message: "Nome deve possuir, no mínimo, 10 caracteres" }),
    email: z.string().email({ message: "Informe um e-mail válido" }),
    cidade: z.string().min(2, { message: "Informe a cidade" }),
    telefone: z.string().length(13, { message: "Telefone deve estar no formato (99)999999999" }),
    senha: z.string().min(8, { message: "Senha deve possuir, no mínimo, 8 caracteres" }),
})

type CadastroForm = z.infer<typeof cadastroSchema>

export default function CadCliente() {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CadastroForm>({
        resolver: zodResolver(cadastroSchema),
    })

    async function cadastrar(dados: CadastroForm) {
        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            })

            const corpo = await resposta.json()

            if (!resposta.ok) {
                toast.error(corpo.erro ?? "Não foi possível cadastrar")
                return
            }

            toast.success("Cadastro realizado com sucesso!")
            navigate('/login')
        } catch {
            toast.error("Erro de conexão com o servidor")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16">
            <h1 className="text-3xl font-bold mb-6 text-center text-green-950">Criar conta</h1>

            <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input type="text" {...register('nome')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">E-mail</label>
                    <input type="email" {...register('email')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Cidade</label>
                    <input type="text" {...register('cidade')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.cidade && <p className="text-red-600 text-sm mt-1">{errors.cidade.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input type="text" placeholder="(99)999999999" {...register('telefone')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.telefone && <p className="text-red-600 text-sm mt-1">{errors.telefone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input type="password" {...register('senha')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-couro-escuro text-white rounded-lg px-4 py-2 mt-2 hover:bg-couro-profundo transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>
        </div>
    )
}
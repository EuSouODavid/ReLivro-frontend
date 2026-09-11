import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useClienteStore } from './context/ClienteContext'
import { Link } from 'react-router-dom'

const loginSchema = z.object({
    email: z.string().email({ message: "Informe um e-mail válido" }),
    senha: z.string().min(1, { message: "Informe a senha" }),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const logaCliente = useClienteStore((state) => state.logaCliente)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    async function entrar(dados: LoginForm) {
        try {
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/clientes/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            })

            const corpo = await resposta.json()

            if (!resposta.ok) {
                toast.error(corpo.erro ?? "Não foi possível entrar")
                return
            }

            logaCliente(corpo)
            localStorage.setItem('clienteKey', corpo.id)
            toast.success(`Bem-vindo(a), ${corpo.nome}!`)
            navigate('/')
        } catch {
            toast.error("Erro de conexão com o servidor")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-16">
            <h1 className="text-3xl font-bold mb-6 text-center text-green-950">Entrar</h1>

            <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">E-mail</label>
                    <input type="email" {...register('email')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input type="password" {...register('senha')} className="w-full border rounded-lg px-3 py-2" />
                    {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 text-white rounded-lg px-4 py-2 mt-2 disabled:opacity-50"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                    Não tem uma conta?{" "}
                    <Link to="/cadastro" className="text-amber-950 font-medium hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </form>
        </div>
    )
}
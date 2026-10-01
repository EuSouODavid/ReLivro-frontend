import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const adminLoginSchema = z.object({
    email: z.string().email({ message: 'Informe um e-mail válido' }),
    senha: z.string().min(1, { message: 'Informe a senha' }),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdminLoginForm>({
        resolver: zodResolver(adminLoginSchema),
    })

    async function entrar(dados: AdminLoginForm) {
        try {
            const endpoints = [`${import.meta.env.VITE_API_URL}/admins/login`, `${import.meta.env.VITE_API_URL}/admin/login`]

            let resposta = null
            let corpo = null

            for (const endpoint of endpoints) {
                resposta = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados),
                })

                corpo = await resposta.json().catch(() => null)

                if (resposta.ok) break

                if (resposta.status !== 404) break
            }

            if (!resposta || !resposta.ok) {
                toast.error(corpo?.erro ?? 'Não foi possível entrar como administrador')
                return
            }

            const adminId = corpo?.admin?.id ?? corpo?.id ?? 'admin'
            const nomeAdmin = corpo?.admin?.nome ?? corpo?.nome ?? 'administrador'
            const tokenAdmin = corpo?.token ?? null

            if (tokenAdmin) {
                localStorage.setItem('adminToken', tokenAdmin)
            }

            localStorage.setItem('adminKey', String(adminId))
            toast.success(`Bem-vindo, ${nomeAdmin}!`)
            navigate('/admin/dashboard')
        } catch {
            toast.error('Erro de conexão com o servidor')
        }
    }

    return (
        <div className="mx-auto mt-16 max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-6 text-center text-3xl font-bold text-emerald-900 dark:text-white">Login do admin</h1>

            <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                    <input
                        type="email"
                        {...register('email')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    <input
                        type="password"
                        {...register('senha')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Voltar para a loja:{' '}
                    <Link to="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                        Início
                    </Link>
                </p>
            </form>
        </div>
    )
}

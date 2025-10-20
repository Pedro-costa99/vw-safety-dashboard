import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useSignIn } from '@/features/auth/hooks'
import { AUTH_ALLOWED_EMAILS, AUTH_FAKE_PASSWORD } from '@/features/auth/constants'

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe um e-mail')
    .email('E-mail inválido')
    .refine((value) => AUTH_ALLOWED_EMAILS.includes(value.toLowerCase()), {
      message: 'Utilize um e-mail autorizado para o mock',
    }),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine((value) => value === AUTH_FAKE_PASSWORD, {
      message: 'Senha incorreta. Consulte as credenciais mock abaixo.',
    }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export const LoginPage = () => {
  const search = useSearch({ from: '/login' })
  const navigate = useNavigate()
  const signIn = useSignIn()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: AUTH_ALLOWED_EMAILS[0] ?? '',
      password: AUTH_FAKE_PASSWORD,
    },
  })

  useEffect(() => {
    setValue('password', AUTH_FAKE_PASSWORD)
  }, [setValue])

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn.mutateAsync(values)
      await navigate({ to: search.redirect ?? '/dashboard' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar.'
      setError('root', { message })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Acessar painel</h1>
          <p className="text-sm text-muted-foreground">
            Use as credenciais mock para explorar o VW Safety Dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              E-mail autorizado
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="admin@vw-safety.com"
              {...register('email')}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Senha mock
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="seguranca123"
              {...register('password')}
            />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || signIn.isPending}
          >
            {signIn.isPending ? 'Entrando...' : 'Entrar no painel'}
          </button>
          {errors.root?.message ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errors.root.message}
            </p>
          ) : null}
        </form>
        <div className="mt-6 rounded-md border border-dashed border-border px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Credenciais mock disponíveis:</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {AUTH_ALLOWED_EMAILS.map((email) => (
              <li key={email}>
                <span className="font-semibold">{email}</span> / {AUTH_FAKE_PASSWORD}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

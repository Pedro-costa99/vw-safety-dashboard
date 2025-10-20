import type { PropsWithChildren } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuthSession, useSignOut } from '@/features/auth/hooks'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/models', label: 'Modelos' },
  { to: '/recalls', label: 'Recalls' },
] as const

export const AppLayout = ({ children }: PropsWithChildren) => {
  const { data: session } = useAuthSession()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const { location } = useRouterState()

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    await navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <div className="container flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="text-lg font-semibold">VW Safety Dashboard</span>
              <nav className="hidden items-center gap-2 text-sm font-medium text-muted-foreground sm:flex">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'rounded-md px-3 py-1 transition hover:text-foreground',
                        isActive
                          ? 'bg-primary/15 text-foreground shadow-sm'
                          : 'text-muted-foreground',
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium leading-none">{session?.user.name ?? 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">{session?.user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-border bg-background px-3 py-1 text-sm font-medium transition hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={signOut.isPending}
              >
                {signOut.isPending ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        </header>
        <main className="container flex-1 py-8">{children}</main>
      </div>
    </div>
  )
}

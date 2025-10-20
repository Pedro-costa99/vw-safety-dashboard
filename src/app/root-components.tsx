import { Outlet, useRouterState } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AppLayout } from '@/layouts/app-layout'

export function RootComponent() {
  const { location } = useRouterState()
  const isAuthRoute = location.pathname.startsWith('/login')
  const content = <Outlet />

  return (
    <>
      {isAuthRoute ? content : <AppLayout>{content}</AppLayout>}
      {import.meta.env.DEV ? (
        <>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      ) : null}
    </>
  )
}

export function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="text-muted-foreground">Verifique o endereço digitado ou volte para o dashboard.</p>
    </div>
  )
}

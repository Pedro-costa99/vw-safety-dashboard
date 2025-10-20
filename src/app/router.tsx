import { createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { DashboardPage } from '@/pages/dashboard-page'
import { LoginPage } from '@/pages/login-page'
import { ModelsPage } from '@/pages/models-page'
import { RecallsPage } from '@/pages/recalls-page'
import { queryClient } from '@/lib/query-client'
import { AUTH_SESSION_QUERY_KEY } from '@/features/auth/constants'
import type { AuthSession } from '@/features/auth/types'
import { clearSession } from '@/features/auth/storage'
import { z } from 'zod'
import { NotFoundComponent, RootComponent } from './root-components'

export type RouterContext = {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

type RequireAuthArgs = {
  context: RouterContext
  location: {
    href?: string
    pathname?: string
    search?: unknown
    hash?: string
  }
}

const requireAuth = ({ context, location }: RequireAuthArgs) => {
  const session = context.queryClient.getQueryData<AuthSession | null>(AUTH_SESSION_QUERY_KEY)
  const expiresAt = (session as { expiresAt?: number } | null)?.expiresAt
  if (!session || (typeof expiresAt === 'number' && expiresAt <= Date.now())) {
    clearSession()
    context.queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
    const pathname = typeof location?.pathname === 'string' ? location.pathname : '/'
    const search = typeof location?.search === 'string' ? location.search : ''
    const hash = typeof location?.hash === 'string' ? location.hash : ''
    const redirectTo =
      typeof location?.href === 'string' ? location.href : `${pathname}${search}${hash}`
    throw redirect({
      to: '/login',
      search: { redirect: redirectTo },
    })
  }
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
})

const modelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'models',
  beforeLoad: requireAuth,
  component: ModelsPage,
})

const recallsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'recalls',
  beforeLoad: requireAuth,
  component: RecallsPage,
})

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context }) => {
    const session = context.queryClient.getQueryData<AuthSession | null>(AUTH_SESSION_QUERY_KEY)
    if (session?.expiresAt && session.expiresAt <= Date.now()) {
      clearSession()
      context.queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
      return
    }
    if (session && (!session.expiresAt || session.expiresAt > Date.now())) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const routeTree = rootRoute.addChildren([rootIndexRoute, loginRoute, dashboardRoute, modelsRoute, recallsRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 1_000 * 5,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

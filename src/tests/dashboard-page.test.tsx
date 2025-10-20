import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren, ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '@/pages/dashboard-page'

vi.mock('@/lib/api/nhtsa', () => ({
  DEFAULT_MAKE: 'volkswagen',
  decodeVin: vi.fn(),
  useModelsForMakeQuery: () => ({
    data: {
      Results: [{ Model_ID: 1, Model_Name: 'Taos', Make_ID: 191, Make_Name: 'Volkswagen' }],
    },
    isLoading: false,
  }),
  useVehicleTypesForMakeQuery: () => ({
    data: {
      Results: [{ VehicleTypeId: 2, VehicleTypeName: 'SUV', Make_ID: 191, Make_Name: 'Volkswagen' }],
    },
    isLoading: false,
  }),
  useVolkswagenRecallsQuery: () => ({
    data: [
      {
        ReportReceivedDate: '2024-01-10',
        Component: 'AIR BAGS',
        Summary: 'Campanha de teste',
        ModelYear: '2024',
        Make: 'VOLKSWAGEN',
        Model: 'TAOS',
        NHTSACampaignNumber: '24V123',
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('recharts', () => {
  const Component = ({ children }: PropsWithChildren): ReactElement => <div>{children}</div>
  return {
    ResponsiveContainer: Component,
    BarChart: Component,
    CartesianGrid: Component,
    XAxis: Component,
    YAxis: Component,
    Tooltip: Component,
    Bar: Component,
  }
})

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  cleanup()
})

const createWrapper =
  () =>
  ({ children }: PropsWithChildren): ReactElement => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

describe('DashboardPage', () => {
  it('exibe os cards principais com dados mockados', () => {
    render(<DashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Modelos Volkswagen')).toBeInTheDocument()
    const modelsCard = screen.getByText('Modelos Volkswagen').closest('article')
    expect(modelsCard).not.toBeNull()
    expect(modelsCard).toHaveTextContent('1')

    expect(screen.getByText('Recalls ativos')).toBeInTheDocument()
    const recallsCard = screen.getByText('Recalls ativos').closest('article')
    expect(recallsCard).not.toBeNull()
    expect(recallsCard).toHaveTextContent('1')
    expect(screen.getByText('09 jan 2024')).toBeInTheDocument()
  })
})

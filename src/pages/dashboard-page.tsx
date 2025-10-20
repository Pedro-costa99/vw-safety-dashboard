import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DEFAULT_MAKE,
  decodeVin,
  useModelsForMakeQuery,
  useVehicleTypesForMakeQuery,
  useVolkswagenRecallsQuery,
} from '@/lib/api/nhtsa'
import { formatDate, formatNumber, parseNhtsaDate } from '@/lib/format'

const vinFormSchema = z.object({
  vin: z
    .string()
    .min(11, 'Informe pelo menos 11 caracteres do VIN')
    .max(17, 'O VIN deve ter no máximo 17 caracteres')
    .regex(/^[A-HJ-NPR-Z0-9]+$/i, 'Use apenas caracteres válidos para VIN (sem I, O, Q)'),
})

type VinFormValues = z.infer<typeof vinFormSchema>

export const DashboardPage = () => {
  const modelsQuery = useModelsForMakeQuery(DEFAULT_MAKE)
  const vehicleTypesQuery = useVehicleTypesForMakeQuery(DEFAULT_MAKE)
  const recallsQuery = useVolkswagenRecallsQuery()

  const totalModels = modelsQuery.data?.Results.length ?? 0
  const totalVehicleTypes = vehicleTypesQuery.data?.Results.length ?? 0
  const recallRecords = useMemo(
    () => recallsQuery.data ?? [],
    [recallsQuery.data],
  )
  const totalRecalls = recallRecords.length

  const lastRecallDate = useMemo(() => {
    if (!recallRecords.length) {
      return null
    }
    const parsed = parseNhtsaDate(recallRecords[0].ReportReceivedDate)
    return parsed ?? null
  }, [recallRecords])

  const recallsByYear = useMemo(() => {
    if (!recallRecords.length) {
      return []
    }
    const buckets = recallRecords.reduce<Record<string, number>>((acc, recall) => {
      const year = recall.ModelYear && recall.ModelYear !== '0' ? recall.ModelYear : 'Sem ano'
      acc[year] = (acc[year] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(buckets)
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => {
        const yearA = Number.parseInt(a.year, 10)
        const yearB = Number.parseInt(b.year, 10)
        if (Number.isNaN(yearA) || Number.isNaN(yearB)) {
          return a.year.localeCompare(b.year)
        }
        return yearA - yearB
      })
  }, [recallRecords])

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VinFormValues>({
    resolver: zodResolver(vinFormSchema),
    defaultValues: { vin: '' },
  })

  const vinDecoder = useMutation({
    mutationFn: async (value: string) => {
      const response = await decodeVin(value.trim().toUpperCase())
      const entry = response.Results.find((item) => item.Model || item.Make)
      if (!entry) {
        throw new Error('Nenhuma informação encontrada para este VIN.')
      }
      return entry
    },
  })

  const onDecodeVin = async (values: VinFormValues) => {
    try {
      await vinDecoder.mutateAsync(values.vin)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao decodificar VIN.'
      setError('vin', { message })
      return
    }
    reset({ vin: '' })
  }

  const cards = [
    {
      title: 'Modelos Volkswagen',
      helper: 'Total consultado via GetModelsForMake',
      value: modelsQuery.isLoading ? '...' : formatNumber(totalModels),
    },
    {
      title: 'Recalls ativos',
      helper: 'Recalls listados pela NHTSA',
      value: recallsQuery.isLoading ? '...' : formatNumber(totalRecalls),
    },
    {
      title: 'Último recall',
      helper: 'Data do relatório mais recente',
      value: lastRecallDate ? formatDate(lastRecallDate) : recallsQuery.isLoading ? '...' : 'Sem registro',
    },
    {
      title: 'Tipos de veículos',
      helper: 'Categorias retornadas por VehicleTypesForMake',
      value: vehicleTypesQuery.isLoading ? '...' : formatNumber(totalVehicleTypes),
    },
  ]

  const decodedVin = vinDecoder.data

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-lg border border-border bg-card/80 p-4 shadow-sm transition hover:border-primary/40"
          >
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_3fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recalls por ano</h2>
              <p className="text-sm text-muted-foreground">
                Distribuição dos recalls registrados para a Volkswagen na NHTSA.
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recallsByYear}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis width={40} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }}
                  contentStyle={{ borderRadius: 8, borderColor: '#1d4ed8' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!recallsByYear.length && !recallsQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhum recall encontrado para a Volkswagen no período informado pela NHTSA.
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Decoder de VIN</h2>
            <p className="text-sm text-muted-foreground">
              Informe um VIN Volkswagen (17 caracteres) para visualizar detalhes relevantes.
            </p>
          </div>
          <form onSubmit={handleSubmit(onDecodeVin)} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={17}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Ex: 3VWDP7AJ5DM210123"
                {...register('vin')}
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={vinDecoder.isPending || isSubmitting}
              >
                {vinDecoder.isPending ? 'Consultando...' : 'Decodificar'}
              </button>
            </div>
            {errors.vin ? <p className="text-xs text-destructive">{errors.vin.message}</p> : null}
            {vinDecoder.isError ? (
              <p className="text-xs text-destructive">
                {vinDecoder.error instanceof Error ? vinDecoder.error.message : 'Falha ao consultar VIN.'}
              </p>
            ) : null}
          </form>

          <div className="mt-4 space-y-2 text-sm">
            {vinDecoder.isPending ? (
              <p className="text-muted-foreground">Consultando dados do VIN...</p>
            ) : decodedVin ? (
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Modelo</dt>
                  <dd className="font-medium">{decodedVin.Model || '--'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Ano</dt>
                  <dd className="font-medium">{decodedVin.ModelYear || '--'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Tipo de veículo</dt>
                  <dd className="font-medium">{decodedVin.VehicleType || '--'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Body Class</dt>
                  <dd className="font-medium">{decodedVin.BodyClass || '--'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Planta</dt>
                  <dd className="font-medium">
                    {decodedVin.PlantCity ? `${decodedVin.PlantCity} - ${decodedVin.PlantCountry ?? '--'}` : '--'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground">
                Informe um VIN válido para visualizar detalhes de fabricação e especificações.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useVolkswagenRecallsQuery } from '@/lib/api/nhtsa'
import { formatDate, formatNumber } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

const PIE_COLORS = ['#2563eb', '#1d4ed8', '#65a30d', '#d97706', '#dc2626', '#7c3aed']
const PAGE_SIZE_OPTIONS = [10, 20, 50]

export const RecallsPage = () => {
  const recallsQuery = useVolkswagenRecallsQuery()
  const recalls = useMemo(() => recallsQuery.data ?? [], [recallsQuery.data])

  const [yearFilter, setYearFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [componentFilter, setComponentFilter] = useState('')

  const filterOptions = useMemo(() => {
    const years = new Set<string>()
    const models = new Set<string>()
    const components = new Set<string>()

    recalls.forEach((item) => {
      if (item.ModelYear && item.ModelYear !== '0') {
        years.add(item.ModelYear)
      }
      if (item.Model) {
        models.add(item.Model)
      }
      if (item.Component) {
        components.add(item.Component)
      }
    })

    const sortStrings = (values: Set<string>) => Array.from(values).sort((a, b) => a.localeCompare(b))

    return {
      years: sortStrings(years),
      models: sortStrings(models),
      components: sortStrings(components),
    }
  }, [recalls])

  const filteredRecalls = useMemo(() => {
    return recalls.filter((recall) => {
      const matchesYear = yearFilter ? recall.ModelYear === yearFilter : true
      const matchesModel = modelFilter ? recall.Model === modelFilter : true
      const matchesComponent = componentFilter ? recall.Component === componentFilter : true
      return matchesYear && matchesModel && matchesComponent
    })
  }, [recalls, yearFilter, modelFilter, componentFilter])

  const recallsByComponent = useMemo(() => {
    if (!filteredRecalls.length) {
      return []
    }
    const buckets = filteredRecalls.reduce<Record<string, number>>((acc, recall) => {
      const component = recall.Component || 'Não informado'
      acc[component] = (acc[component] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(buckets)
      .map(([component, value]) => ({ component, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredRecalls])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const hasResults = filteredRecalls.length > 0
  const totalPages = hasResults ? Math.ceil(filteredRecalls.length / pageSize) : 1
  const safePage = hasResults ? Math.min(page, totalPages) : 1
  const startIndex = hasResults ? (safePage - 1) * pageSize : 0
  const visibleRecalls = hasResults
    ? filteredRecalls.slice(startIndex, startIndex + pageSize)
    : []
  const startItem = hasResults ? startIndex + 1 : 0
  const endItem = hasResults ? startIndex + visibleRecalls.length : 0

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const summaryText = recallsQuery.isLoading
    ? 'Carregando...'
    : hasResults
    ? `Mostrando ${formatNumber(startItem)}–${formatNumber(endItem)} de ${formatNumber(filteredRecalls.length)} registro(s)`
    : 'Nenhum recall encontrado'

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Recalls</h1>
        <p className="text-sm text-muted-foreground">
          Explore os recalls registrados pela NHTSA com filtros por ano, modelo e componente.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label className="grid gap-1 text-sm font-medium">
            Ano
            {recallsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Modelo
            {recallsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <select
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                {filterOptions.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="grid gap-1 text-sm font-medium sm:col-span-2 lg:col-span-1 xl:col-span-2">
            Componente
            {recallsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <select
                value={componentFilter}
                onChange={(event) => setComponentFilter(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos</option>
                {filterOptions.components.map((component) => (
                  <option key={component} value={component}>
                    {component}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Distribuição por componente</h2>
          <p className="text-sm text-muted-foreground">
            Visualize quais sistemas concentram a maior parte dos recalls recentes.
          </p>
          <div className="mt-4 h-72">
            {recallsQuery.isLoading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={recallsByComponent} nameKey="component" innerRadius={50} outerRadius={100}>
                    {recallsByComponent.map((entry, index) => (
                      <Cell key={entry.component} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} recall(s)`, 'Total']}
                    contentStyle={{ borderRadius: 8, borderColor: '#1d4ed8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {!recallsQuery.isLoading && recallsByComponent.length ? (
            <div className="mt-4 max-h-32 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2 text-xs">
                {recallsByComponent.map((entry, index) => (
                  <span
                    key={entry.component}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="font-medium">{entry.component}</span>
                    <span className="text-muted-foreground">· {entry.value}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {!recallsByComponent.length && !recallsQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum recall encontrado com os filtros atuais.</p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Lista de recalls</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm text-muted-foreground">{summaryText}</span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Itens por página
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setPage(1)
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={!hasResults || safePage === 1 || recallsQuery.isLoading}
                    className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-muted"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-medium text-muted-foreground">
                    {hasResults ? `${safePage} / ${totalPages}` : '0 / 0'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={!hasResults || safePage === totalPages || recallsQuery.isLoading}
                    className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-muted"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-medium">
                    Modelo / Ano
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-medium">
                    Componente
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-medium">
                    Resumo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recallsQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <Fragment key={index}>
                        <tr className="hover:bg-muted/40">
                          <td className="px-4 py-3">
                            <Skeleton className="h-5 w-24" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-3 w-10" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-5 w-40" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-5 w-full" />
                          </td>
                        </tr>
                      </Fragment>
                    ))
                  : visibleRecalls.length ? (
                  visibleRecalls.map((recall) => (
                    <tr
                      key={`${recall.Model}-${recall.ModelYear}-${recall.Component}-${recall.ReportReceivedDate}`}
                      className="hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(recall.ReportReceivedDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">{recall.Model || '--'}</span>
                        <span className="ml-1 text-xs text-muted-foreground">{recall.ModelYear}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{recall.Component || '--'}</td>
                      <td className="px-4 py-3 text-muted-foreground leading-relaxed">{recall.Summary}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                      Nenhum recall corresponde aos filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

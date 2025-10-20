import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { DEFAULT_MAKE, useModelsForMakeQuery, useVehicleTypesForMakeQuery } from '@/lib/api/nhtsa'
import { formatNumber } from '@/lib/format'

const MODEL_PAGE_SIZE_OPTIONS = [10, 20, 40]

export const ModelsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase())

  const modelsQuery = useModelsForMakeQuery(DEFAULT_MAKE)
  const vehicleTypesQuery = useVehicleTypesForMakeQuery(DEFAULT_MAKE)

  const models = useMemo(() => modelsQuery.data?.Results ?? [], [modelsQuery.data?.Results])

  const vehicleTypes = useMemo(() => {
    if (!vehicleTypesQuery.data?.Results) {
      return []
    }
    const unique = new Map<string, number>()
    vehicleTypesQuery.data.Results.forEach((item) => {
      unique.set(item.VehicleTypeName, (unique.get(item.VehicleTypeName) ?? 0) + 1)
    })
    return Array.from(unique.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [vehicleTypesQuery.data])

  const filteredModels = useMemo(() => {
    if (!deferredSearch) {
      return models
    }
    return models.filter((model) => model.Model_Name.toLowerCase().includes(deferredSearch))
  }, [models, deferredSearch])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(MODEL_PAGE_SIZE_OPTIONS[0])

  const hasResults = filteredModels.length > 0
  const totalPages = hasResults ? Math.ceil(filteredModels.length / pageSize) : 1
  const safePage = hasResults ? Math.min(page, totalPages) : 1
  const startIndex = hasResults ? (safePage - 1) * pageSize : 0
  const visibleModels = hasResults ? filteredModels.slice(startIndex, startIndex + pageSize) : []
  const startItem = hasResults ? startIndex + 1 : 0
  const endItem = hasResults ? startIndex + visibleModels.length : 0

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage)
    }
  }, [page, safePage])

  const summaryText = modelsQuery.isLoading
    ? 'Carregando...'
    : hasResults
    ? `Mostrando ${formatNumber(startItem)}-${formatNumber(endItem)} de ${formatNumber(filteredModels.length)} modelo(s)`
    : 'Nenhum modelo encontrado'

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Modelos Volkswagen</h1>
        <p className="text-sm text-muted-foreground">
          Explore o catálogo de modelos oficiais da Volkswagen cadastrados na NHTSA.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Catálogo oficial</h2>
            <p className="text-sm text-muted-foreground">
              Encontramos {formatNumber(models.length)} modelos cadastrados para a marca na base federal.
            </p>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome do modelo"
            className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">{summaryText}</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              Itens por página
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
              >
                {MODEL_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasResults || safePage === 1 || modelsQuery.isLoading}
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
                disabled={!hasResults || safePage === totalPages || modelsQuery.isLoading}
                className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-muted"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium">
                  Modelo
                </th>
                <th scope="col" className="px-4 py-2 text-left font-medium">
                  Marca
                </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modelsQuery.isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={2}>
                      Carregando modelos...
                    </td>
                  </tr>
              ) : visibleModels.length ? (
                visibleModels.map((model) => (
                  <tr key={`${model.Make_ID}-${model.Model_Name}`} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{model.Model_Name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{model.Make_Name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={2}>
                    Nenhum modelo encontrado para a busca realizada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Principais tipos de veículos</h2>
        <p className="text-sm text-muted-foreground">
          Classificações fornecidas pelo endpoint VehicleTypesForMake da NHTSA.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {vehicleTypesQuery.isLoading ? (
            <span className="text-sm text-muted-foreground">Carregando tipos...</span>
          ) : vehicleTypes.length ? (
            vehicleTypes.map((type) => (
              <span
                key={type.name}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {type.name} - {formatNumber(type.count)}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Nenhuma classificação disponível.</span>
          )}
        </div>
      </section>
    </div>
  )
}
